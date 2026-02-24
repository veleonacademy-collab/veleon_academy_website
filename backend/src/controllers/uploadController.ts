import { Request, Response, NextFunction } from "express";
import { uploadFile as uploadToStorage } from "../services/storageService.js";
import { logger } from "../utils/logger.js";

export async function uploadFile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const folder = (req.body.folder as string) || "fashion";
    const fileUrl = await uploadToStorage(
      req.file.buffer,
      folder,
      undefined,
      req.file.mimetype,
      req.file.originalname  // ← pass the original filename so extension is preserved
    );

    res.json({ imageUrl: fileUrl });
  } catch (error) {
    logger.error("Error in uploadFile controller:", error);
    next(error);
  }
}
