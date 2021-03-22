import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'julllnubereats123';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: 'AKIA2SVLDQM3XOL2JIQL',
        secretAccessKey: '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'
      }
    });

    try {
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3()
        // 한번만 실행하는 코드. 버킷 생성 후 주석처리 함
        // .createBucket({
        //   Bucket: BUCKET_NAME
        // })
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}