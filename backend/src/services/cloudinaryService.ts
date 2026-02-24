import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "fashion",
  originalName?: string,
  mimeType?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Build upload options
    const uploadOptions: Record<string, any> = {
      resource_type: "auto",
    };

    if (originalName) {
      // Sanitize: replace spaces → underscores, strip chars Cloudinary dislikes
      const sanitized = originalName
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");

      const dotIndex = sanitized.lastIndexOf(".");
      const ext      = dotIndex !== -1 ? sanitized.substring(dotIndex)     : "";  // e.g. ".docx"
      const baseName = dotIndex !== -1 ? sanitized.substring(0, dotIndex)  : sanitized;

      // Determine if this is a raw (non-image, non-video) file.
      // For raw resources Cloudinary does NOT auto-append the extension —
      // it must be part of the public_id. For images/videos it IS auto-appended,
      // so we strip it to avoid doubling (e.g. "file.jpg.jpg").
      const isRaw = mimeType
        ? !mimeType.startsWith("image/") && !mimeType.startsWith("video/")
        : ext !== "" && ![".jpg",".jpeg",".png",".gif",".webp",".mp4",".mov",".avi"].includes(ext.toLowerCase());

      // Compose public_id — include the folder prefix here so we don't double it
      const publicId = isRaw
        ? `${folder}/${baseName}${ext}`   // raw: keep extension in public_id
        : `${folder}/${baseName}`;        // image/video: strip extension, Cloudinary adds it

      uploadOptions.public_id      = publicId;
      uploadOptions.unique_filename = true;   // append a short unique suffix to avoid collisions
      // Note: do NOT set `folder` separately — it's already baked into public_id above
    } else {
      // No filename provided — just use the folder
      uploadOptions.folder = folder;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload failed:", error);
          return reject(new Error("Failed to upload file to Cloudinary"));
        }
        if (!result) {
          return reject(new Error("Cloudinary upload returned no result"));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export { cloudinary };
