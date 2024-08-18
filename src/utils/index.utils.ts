import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
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
    return await QRCode.toBuffer(url);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}
