import jwt, { SignOptions } from "jsonwebtoken";
import config from "config";

const privateKey = config.get<string>("privateKey");
const publicKey = config.get<string>("publicKey");

export function signJwt(payload: Object, options?: SignOptions | undefined) {
  return jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      decoded,
      valid: true,
      expired: false,
    };
  } catch (error: any) {
    return {
      decoded: null,
      valid: false,
      expired: error.message === "jwt expired",
    };
  }
}
