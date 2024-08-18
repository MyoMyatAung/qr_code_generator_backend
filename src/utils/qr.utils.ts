import { DeleteParams, UploadParams } from "../utils/file-upload.utils";
import upload, { deleteImage } from "../utils/file-upload.utils";

export async function uploadToS3(bucket: string, key: string, body: Buffer, contentType: string) {
  const uploadParams: UploadParams = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  };
  const result = await upload(uploadParams);
  if (!result.success || !result.url || !result.key) {
    throw new Error("Error in uploading to S3");
  }
  return result;
}

export async function deleteFromS3(bucket: string, key: string) {
  const deleteParams: DeleteParams = {
    Bucket: bucket,
    Key: key,
  };
  const result = await deleteImage(deleteParams);
  if (!result) {
    throw new Error("Error in deleting from S3");
  }
  return result;
}
