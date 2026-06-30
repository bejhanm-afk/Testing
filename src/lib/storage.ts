import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Storage abstraction. The "local" driver writes to /public/uploads so files
 * are served statically in dev. The interface is intentionally tiny so an S3
 * driver can be dropped in later without touching call sites.
 */

export interface StoredFile {
  url: string;
  key: string;
}

export interface StorageDriver {
  put(siteId: string, filename: string, body: Buffer, mimeType: string): Promise<StoredFile>;
}

const LOCAL_DIR = process.env.LOCAL_UPLOAD_DIR ?? "public/uploads";

function safeName(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return `${randomUUID()}${ext}`;
}

class LocalStorage implements StorageDriver {
  async put(siteId: string, filename: string, body: Buffer): Promise<StoredFile> {
    const name = safeName(filename);
    const key = `${siteId}/${name}`;
    const absDir = path.join(process.cwd(), LOCAL_DIR, siteId);
    await mkdir(absDir, { recursive: true });
    await writeFile(path.join(absDir, name), body);
    return { url: `/uploads/${key}`, key };
  }
}

/**
 * Placeholder S3 driver. Wired to env but the actual upload is implemented in
 * the storage phase; kept here so STORAGE_DRIVER=s3 fails loudly rather than
 * silently writing to disk.
 */
class S3Storage implements StorageDriver {
  async put(): Promise<StoredFile> {
    throw new Error(
      "S3 storage driver is not implemented yet. Set STORAGE_DRIVER=local."
    );
  }
}

let driver: StorageDriver | null = null;

export function getStorage(): StorageDriver {
  if (driver) return driver;
  driver =
    process.env.STORAGE_DRIVER === "s3" ? new S3Storage() : new LocalStorage();
  return driver;
}
