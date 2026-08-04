import { createHmac } from "node:crypto";
import { env } from "@/lib/env";

export type ImageKitSignature = {
  token: string;
  signature: string;
  expire: number;
  publicKey: string;
  urlEndpoint: string;
};

function imagekitConfigured(): boolean {
  return Boolean(
    env.IMAGEKIT_PUBLIC_KEY &&
      env.IMAGEKIT_PRIVATE_KEY &&
      env.IMAGEKIT_URL_ENDPOINT,
  );
}

/**
 * Generates a time-limited signature so the browser can upload files directly
 * to ImageKit without exposing the private key.
 * Ref: https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload
 */
export function getImageKitSignature(folder = "linknest"): ImageKitSignature {
  if (!imagekitConfigured()) {
    throw new Error(
      "ImageKit is not configured. Add IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.",
    );
  }
  const expire = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes
  const token = `${expire}_${Math.random().toString(36).slice(2, 12)}`;
  const signature = createHmac("sha1", env.IMAGEKIT_PRIVATE_KEY!)
    .update(token + expire)
    .digest("hex");
  return {
    token,
    signature,
    expire,
    publicKey: env.IMAGEKIT_PUBLIC_KEY!,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT!.replace(/\/$/, ""),
    folder,
  } as ImageKitSignature & { folder: string };
}

export function imagekitEnabled(): boolean {
  return imagekitConfigured();
}

export const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
