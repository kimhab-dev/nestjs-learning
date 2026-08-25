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
        console.log('3. filename called');
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

export function getRelativeFilePath(
  file: Express.Multer.File,
  subFolder = 'products',
): string {
  return `uploads/${subFolder}/${file.filename}`;
}

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

export function cleanupRequestFiles(req?: any): void {
  if (!req) return;

  const reqObj = req as {
    file?: Express.Multer.File;
    files?:
      Express.Multer.File[] | Record<string, Express.Multer.File[]> | undefined;
  };

  if (reqObj.file?.path) {
    removeUploadedFile(reqObj.file.path);
  }

  if (Array.isArray(reqObj.files)) {
    for (const file of reqObj.files) {
      if (file?.path) {
        removeUploadedFile(file.path);
      }
    }
  } else if (reqObj.files && typeof reqObj.files === 'object') {
    for (const key of Object.keys(reqObj.files)) {
      const files = reqObj.files[key];
      if (Array.isArray(files)) {
        for (const file of files) {
          if (file?.path) {
            removeUploadedFile(file.path);
          }
        }
      }
    }
  }
}
