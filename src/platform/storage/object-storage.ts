export interface PresignedUpload {
  uploadUrl: string;
  storageKey: string;
  expiresAt: Date;
}

export interface ObjectStorage {
  createPresignedPut(input: {
    storageKey: string;
    contentType?: string;
    expiresSeconds: number;
  }): Promise<PresignedUpload>;

  verifyObjectContentHash(storageKey: string, expectedHash: string): Promise<boolean>;
}
