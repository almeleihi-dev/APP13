export interface PresignedUpload {
  uploadUrl: string;
  storageKey: string;
  expiresAt: Date;
}

export interface PresignedDownload {
  downloadUrl: string;
  expiresAt: Date;
}

export interface ObjectStorage {
  createPresignedPut(input: {
    storageKey: string;
    contentType?: string;
    expiresSeconds: number;
  }): Promise<PresignedUpload>;

  createPresignedGet(input: {
    storageKey: string;
    expiresSeconds: number;
  }): Promise<PresignedDownload>;

  objectExists(storageKey: string): Promise<boolean>;

  verifyObjectContentHash(storageKey: string, expectedHash: string): Promise<boolean>;
}
