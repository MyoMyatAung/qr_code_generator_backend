import config from "config";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { DefaultConfig } from "../libs";
import { Readable } from "stream";

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

export async function upload(param: UploadParams): Promise<{ success: boolean, url?: string, key?: string, error?: unknown }> {
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
    console.log(error);
    return false;
  }
}

export const getImage = async (key: string, bucket: string) => {
  const command = new GetObjectCommand({
    Bucket: config.get<string>(bucket),
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    if (!response.Body) {
      throw new Error("Cannot get object");
    }
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    const str = await response.Body.transformToString("base64");
    return { base64: str, contentType: response.ContentType };
  } catch (err) {
    throw err;
  }
};

// Helper function to stream the file from S3
export const getFileStreamFromS3 = async (key: string, bucket: string) => {
  const bucketParams = {
    Bucket: config.get<string>(bucket),
    Key: key,
  };

  const command = new GetObjectCommand(bucketParams);
  const { Body } = await s3Client.send(command);

  if (Body instanceof Readable) {
    return Body; // Return the stream of the file
  }

  throw new Error('Unable to read file from S3');
};

export default upload;
