import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { Jimp, JimpMime } from "jimp";

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
    const logoPath = path.resolve(__dirname, '../public/logo.jpg');
    // Step 1: Generate the QR code as a buffer
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H', // High error correction level to allow for logo
      type: 'png',
      width: 140, // QR code size
    });
    // Step 2: Read the QR code and logo images using Jimp
    const qrImage = await Jimp.read(qrCodeBuffer);
    const logo = await Jimp.read(logoPath);
    // Step 3: Resize the logo to fit in the center of the QR code
    const logoSize: number = qrImage.bitmap.width / 4; // Set the logo size to 1/4th of the QR code size
    logo.resize({ w: logoSize, h: logoSize });
    // Step 4: Composite the logo on the center of the QR code
    const x = (qrImage.bitmap.width - logo.bitmap.width) / 2;
    const y = (qrImage.bitmap.height - logo.bitmap.height) / 2;
    qrImage.composite(logo, x, y);

    return qrImage.getBuffer(JimpMime.png);

  } catch (error) {
    console.error(error);
    throw new Error('Failed to generate QR code');
  }
}
