import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { env, publicServerUrl } from '../config/env';
import { AppError } from './AppError';

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

let configured = false;

export function cloudinaryEnabled(): boolean {
  return Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);
}

export function configureCloudinary(): void {
  if (!cloudinaryEnabled()) {
    if (env.nodeEnv === 'production') {
      console.warn('Cloudinary is not configured. Production hosts with ephemeral disks will lose local uploads. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    } else {
      console.log('Cloudinary is not configured. Images will be stored in server/uploads.');
    }
    return;
  }

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  configured = true;
}

export function detectImageType(buffer: Buffer): string | null {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png';
  if (buffer.length > 6) {
    const gif = buffer.toString('ascii', 0, 6);
    if (gif === 'GIF87a' || gif === 'GIF89a') return 'image/gif';
  }
  if (buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

function uploadsDir(): string {
  return path.join(process.cwd(), 'uploads');
}

export async function uploadImage(buffer: Buffer, mimetype: string): Promise<{ url: string; publicId: string }> {
  const detected = detectImageType(buffer);
  if (!detected || detected !== mimetype) {
    throw new AppError('Upload a real JPEG, PNG, WebP, or GIF image.', 400);
  }

  if (cloudinaryEnabled()) {
    if (!configured) configureCloudinary();
    try {
      const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'trainonex/projects', resource_type: 'image' },
          (error, result) => {
            if (error || !result) reject(error || new Error('Upload failed'));
            else resolve(result);
          },
        );
        stream.end(buffer);
      });
      return { url: uploaded.secure_url, publicId: uploaded.public_id };
    } catch (error) {
      console.error('Cloudinary upload failed', error);
      throw new AppError('Image upload failed. Check the Cloudinary configuration and try again.', 502);
    }
  }

  const ext = MIME_EXT[detected];
  const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const directory = uploadsDir();
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), buffer);
  return { url: `${publicServerUrl()}/uploads/${filename}`, publicId: `local:${filename}` };
}

export async function deleteImage(publicId?: string): Promise<void> {
  if (!publicId) return;

  if (publicId.startsWith('local:')) {
    const filename = publicId.slice('local:'.length);
    if (!/^[\w.-]+$/.test(filename)) return;
    try {
      await fs.unlink(path.join(uploadsDir(), filename));
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') console.error('Failed to delete local image', error);
    }
    return;
  }

  if (!cloudinaryEnabled()) return;
  if (!configured) configureCloudinary();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete Cloudinary image', error);
  }
}
