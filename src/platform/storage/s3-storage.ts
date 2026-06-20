import { createHash } from "node:crypto";
import type { AppConfig } from "../../shared/config/index.js";
import type { ObjectStorage, PresignedUpload } from "./object-storage.js";

/** In-memory object store for unit tests and local dev without MinIO. */
export class InMemoryObjectStorage implements ObjectStorage {
  private readonly objects = new Map<string, string>();

  seedObject(storageKey: string, contentHash: string): void {
    this.objects.set(storageKey, contentHash.replace(/^sha256:/, ""));
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

  async verifyObjectContentHash(storageKey: string, expectedHash: string): Promise<boolean> {
    const stored = this.objects.get(storageKey);
    if (!stored) return false;
    return stored === expectedHash.replace(/^sha256:/, "");
  }
}

/** S3-compatible presigned PUT + hash verification (MinIO / AWS). */
export class S3ObjectStorage implements ObjectStorage {
  constructor(private readonly config: AppConfig["s3"]) {}

  async createPresignedPut(input: {
    storageKey: string;
    contentType?: string;
    expiresSeconds: number;
  }): Promise<PresignedUpload> {
    const expiresAt = new Date(Date.now() + input.expiresSeconds * 1000);
    const endpoint = this.config.endpoint ?? `https://s3.${this.config.region}.amazonaws.com`;
    const uploadUrl = `${endpoint}/${this.config.bucket}/${input.storageKey}?X-Amz-Expires=${input.expiresSeconds}`;
    return {
      uploadUrl,
      storageKey: input.storageKey,
      expiresAt,
    };
  }

  async verifyObjectContentHash(storageKey: string, expectedHash: string): Promise<boolean> {
    const endpoint = this.config.endpoint;
    if (!endpoint) {
      return false;
    }
    const url = `${endpoint}/${this.config.bucket}/${storageKey}`;
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) return false;
    const body = Buffer.from(await response.arrayBuffer());
    const digest = createHash("sha256").update(body).digest("hex");
    return digest === expectedHash.replace(/^sha256:/, "");
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
