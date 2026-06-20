import { createHash } from "node:crypto";
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { AppConfig } from "../../shared/config/index.js";
import type { ObjectStorage, PresignedDownload, PresignedUpload } from "./object-storage.js";

const DOWNLOAD_URL_TTL_SECONDS = 900;

/** In-memory object store for unit tests and local dev without MinIO. */
export class InMemoryObjectStorage implements ObjectStorage {
  private readonly objects = new Map<string, Buffer>();

  seedObject(storageKey: string, contentHash: string, content?: Buffer): void {
    const hex = contentHash.replace(/^sha256:/, "");
    this.objects.set(storageKey, content ?? Buffer.from(hex, "hex"));
  }

  async createPresignedPut(input: {
    storageKey: string;
    contentType?: string;
    expiresSeconds: number;
  }): Promise<PresignedUpload> {
    void input.contentType;
    return {
      uploadUrl: `memory://upload/${input.storageKey}`,
      storageKey: input.storageKey,
      expiresAt: new Date(Date.now() + input.expiresSeconds * 1000),
    };
  }

  async createPresignedGet(input: {
    storageKey: string;
    expiresSeconds: number;
  }): Promise<PresignedDownload> {
    return {
      downloadUrl: `memory://download/${input.storageKey}`,
      expiresAt: new Date(Date.now() + input.expiresSeconds * 1000),
    };
  }

  async objectExists(storageKey: string): Promise<boolean> {
    return this.objects.has(storageKey);
  }

  async verifyObjectContentHash(storageKey: string, expectedHash: string): Promise<boolean> {
    const stored = this.objects.get(storageKey);
    if (!stored) return false;
    const digest = createHash("sha256").update(stored).digest("hex");
    return digest === expectedHash.replace(/^sha256:/, "");
  }

  /** Test helper — simulates client PUT to presigned URL. */
  putObject(storageKey: string, body: Buffer): void {
    this.objects.set(storageKey, body);
  }
}

function createS3Client(config: AppConfig["s3"]): S3Client {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: true,
    credentials:
      config.accessKey && config.secretKey
        ? { accessKeyId: config.accessKey, secretAccessKey: config.secretKey }
        : undefined,
  });
}

/** S3-compatible presigned PUT/GET + hash verification (MinIO / AWS). */
export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;

  constructor(private readonly config: AppConfig["s3"]) {
    this.client = createS3Client(config);
  }

  async createPresignedPut(input: {
    storageKey: string;
    contentType?: string;
    expiresSeconds: number;
  }): Promise<PresignedUpload> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: input.storageKey,
      ContentType: input.contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: input.expiresSeconds,
    });
    return {
      uploadUrl,
      storageKey: input.storageKey,
      expiresAt: new Date(Date.now() + input.expiresSeconds * 1000),
    };
  }

  async createPresignedGet(input: {
    storageKey: string;
    expiresSeconds: number;
  }): Promise<PresignedDownload> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: input.storageKey,
    });
    const downloadUrl = await getSignedUrl(this.client, command, {
      expiresIn: input.expiresSeconds,
    });
    return {
      downloadUrl,
      expiresAt: new Date(Date.now() + input.expiresSeconds * 1000),
    };
  }

  async objectExists(storageKey: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: storageKey,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async verifyObjectContentHash(storageKey: string, expectedHash: string): Promise<boolean> {
    if (!(await this.objectExists(storageKey))) {
      return false;
    }
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: storageKey,
        })
      );
      const body = await response.Body?.transformToByteArray();
      if (!body) return false;
      const digest = createHash("sha256").update(Buffer.from(body)).digest("hex");
      return digest === expectedHash.replace(/^sha256:/, "");
    } catch {
      return false;
    }
  }
}

export async function ensureS3Bucket(config: AppConfig["s3"]): Promise<void> {
  const client = createS3Client(config);
  try {
    await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: config.bucket }));
  }
}

export function createObjectStorage(config: AppConfig): ObjectStorage {
  if (config.env === "local" && !config.s3.accessKey) {
    return new InMemoryObjectStorage();
  }
  return new S3ObjectStorage(config.s3);
}

export function createInMemoryObjectStorage(): InMemoryObjectStorage {
  return new InMemoryObjectStorage();
}

export { DOWNLOAD_URL_TTL_SECONDS };
