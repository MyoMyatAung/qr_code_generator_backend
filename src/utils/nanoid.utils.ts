import { nanoid } from "nanoid";

function generateUniqueID(): string {
  const uniqueID: string = nanoid(8);
  return uniqueID;
}

export default generateUniqueID;
