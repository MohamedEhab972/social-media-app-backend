import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../../config/env.service.js";
import { MulterStorageEnum } from "../enums/multer.enum.js";
import { createReadStream } from "fs";
import { Upload } from "@aws-sdk/lib-storage";
export class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: env.AWS_ACCESS as string,
        secretAccessKey: env.AWS_SECRIT as string,
      },
    });
  }

  async uploadFile({
    storageKey = MulterStorageEnum.memoryStorage,
    bucketName = env.AWS_BOCKET_NAME as string,
    path = "general",
    fileContent,
    ACL = ObjectCannedACL.private,
    contentType = "application/octet-stream",
  }: {
    storageKey?: MulterStorageEnum;
    bucketName?: string;
    path?: string;
    fileContent: Express.Multer.File;
    ACL?: ObjectCannedACL;
    contentType?: string;
  }) {
    const key = `social-media/${path}/${Date.now()}-${fileContent.originalname}`;
    const result = await this.client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body:
          storageKey === MulterStorageEnum.memoryStorage
            ? fileContent.buffer
            : createReadStream(fileContent.path),
        ContentType: contentType,
        ACL: ACL,
      }),
    );
    return key;
  }

  async uploadBigFiles({
    storageKey = MulterStorageEnum.memoryStorage,
    bucketName = env.AWS_BOCKET_NAME as string,
    path = "general",
    fileContent,
    ACL = ObjectCannedACL.private,
    contentType = "application/octet-stream",
    partSize = 5 * 1024 * 1024, // 5MB
  }: {
    storageKey?: MulterStorageEnum;
    bucketName?: string;
    path?: string;
    fileContent: Express.Multer.File;
    ACL?: ObjectCannedACL;
    contentType?: string;
    partSize?: number;
  }) {
    const key = `social-media/${path}/${Date.now()}-${fileContent.originalname}`;
    const result = await new Upload({
      client: this.client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body:
          storageKey === MulterStorageEnum.memoryStorage
            ? fileContent.buffer
            : createReadStream(fileContent.path),
        ContentType: contentType,
        ACL: ACL,
      },
      partSize: partSize,
    });

    result.on("httpUploadProgress", (progress) => {
      console.log(`Uploaded ${progress.loaded} of ${progress.total} bytes`);
    });

    await result.done();
    return key;
  }

  
}

export const s3Service = new S3Service();
