import config from "config";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { DefaultConfig } from "../lib";

export type UploadParams = {
  Bucket: string;
  Key: string;
  Body: Buffer | undefined;
  ContentType: string | undefined;
};

export type DeleteParams = {
  Bucket: string;
  Key: string;
}


const s3Client = new S3Client({
  region: config.get<string>(DefaultConfig.REGION),
  credentials: {
    accessKeyId: config.get<string>(DefaultConfig.AWS_ACCESS_KEY),
    secretAccessKey: config.get<string>(DefaultConfig.AWS_SECRET_ACCESS_KEY)
  }
});

export async function uploadImage(param: UploadParams): Promise<{ success: boolean, url?: string, key?: string, error?: unknown }> {
  try {
    const [res, region] = await Promise.all([
      s3Client.send(
        new PutObjectCommand(param)
      ),
      s3Client.config.region()
    ]);
    return { success: true, url: `https://${param.Bucket}.s3.${region}.amazonaws.com/${param.Key}`, key: param.Key };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
}

export async function deleteImage(param: DeleteParams): Promise<boolean> {
  try {
    await s3Client.send(new DeleteObjectCommand(param));
    return true;
  } catch (error) {
    return false;
  }
}

export const getImage = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: config.get<string>(DefaultConfig.COURSE_IMG_BUCKET_NAME),
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    if (!response.Body) {
      throw new Error("Cannot get object");
    }
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    const str = await response.Body.transformToString("base64");
    return str;
  } catch (err) {
    throw err;
  }
};

export default uploadImage;
