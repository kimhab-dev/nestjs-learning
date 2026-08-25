import { BadRequestException } from '@nestjs/common';
import { diskStorage, Options } from 'multer';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { extname, join } from 'path';

export interface MulterUploadOptionsConfig {
  destination?: string;
  maxFileSize?: number; // In bytes (default: 5MB)
  allowedMimeTypes?: string[];
}

export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/**
 * Creates reusable Multer options configured for disk storage with dynamic subfolders,
 * automatic directory creation, collision-free naming, and file validation.
 *
 * @example
 * \@UseInterceptors(FileInterceptor('image', multerUploadOptions({ destination: 'products' })))
 */
export function multerUploadOptions(
  config: MulterUploadOptionsConfig = {},
): Options {
  const destinationFolder = config.destination ?? 'misc';
  const maxFileSize = config.maxFileSize ?? 5 * 1024 * 1024; // 5 MB
  const allowedMimeTypes =
    config.allowedMimeTypes ?? DEFAULT_ALLOWED_IMAGE_TYPES;

  const uploadPath = join(process.cwd(), 'uploads', destinationFolder);

  return {
    storage: diskStorage({
      destination: (req, file, callback) => {
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        callback(null, uploadPath);
      },
      filename: (req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = extname(file.originalname).toLowerCase();
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (req, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            `Invalid file type (${file.mimetype}). Allowed types: ${allowedMimeTypes.join(', ')}`,
          ),
        );
      }
      callback(null, true);
    },
  };
}

/**
 * Normalizes an uploaded file path to a URL-friendly path (e.g. `uploads/products/123.jpg`).
 */
export function getRelativeFilePath(
  file: Express.Multer.File,
  subFolder = 'products',
): string {
  return `uploads/${subFolder}/${file.filename}`;
}

/**
 * Safely removes a file from disk given its relative or absolute path.
 */
export function removeUploadedFile(filePath?: string | null): void {
  if (!filePath) return;

  const absolutePath = filePath.startsWith(process.cwd())
    ? filePath
    : join(process.cwd(), filePath.replace(/^[/\\]+/, ''));

  try {
    if (existsSync(absolutePath)) {
      unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error(`Failed to delete file at ${absolutePath}:`, error);
  }
}
