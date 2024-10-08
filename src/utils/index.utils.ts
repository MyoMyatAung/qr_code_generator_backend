import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { createCanvas, loadImage } from 'canvas';
import path from 'path';

export function generateUUID(): string {
  return uuidv4()
}

export function formatNameSlug(input: string): string {
  // Replace spaces with underscores
  const replacedSpaces = input.replace(/ /g, "_");

  // Convert to lowercase
  const lowercaseString = replacedSpaces.toLowerCase();

  return lowercaseString;
}

export function handleError(error: unknown): never {
  if (error instanceof Error) {
    throw new Error(error.message);
  } else {
    throw new Error("Unknow error occured")
  }
}

export async function generateQRCode(url: string): Promise<Buffer> {
  try {
    const canvas = createCanvas(150, 150);
    QRCode.toCanvas(
      canvas,
      url,
      {
        errorCorrectionLevel: "H",
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      }
    );
    const ctx = canvas.getContext("2d");
    const logoPath = path.resolve(__dirname, '../public/logo.jpg');
    const img = await loadImage(logoPath);
    const center = (150 - 50) / 2;
    ctx.drawImage(img, center, center, 40, 40);
    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error(error);
    throw new Error('Failed to generate QR code');
  }
}
