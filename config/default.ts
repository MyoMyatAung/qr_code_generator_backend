import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT,
  dbUri: process.env.MONGO_URI,
  saltWorkFactor: parseInt(process.env.SALT_WORK_FACTOR as string),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL,
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  courseImgBucketName: process.env.AWS_COURSE_IMG_BUCKET_NAME,
  awsAccessKey: process.env.AWS_ACCESS_KEY,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
};
