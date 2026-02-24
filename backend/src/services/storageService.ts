import { env } from "../config/env.js";
import { uploadToCloudinary } from "./cloudinaryService.js";
import { uploadToR2 } from "./r2Service.js";

export async function uploadFile(
  fileBuffer: Buffer,
  folder: string = "fashion",
  fileName?: string,
  contentType?: string,
  originalName?: string
): Promise<string> {
  const provider = env.storageProvider;

  if (provider === "r2") {
    return uploadToR2(fileBuffer, folder, fileName, contentType);
  }

  // Default to cloudinary — pass original filename + mimetype so extension is kept for raw files
  return uploadToCloudinary(fileBuffer, folder, originalName, contentType);
}
