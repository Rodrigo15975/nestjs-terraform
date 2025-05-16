import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { S3Service } from './s3.service'

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('/product/:productId')
  @UseInterceptors(FileInterceptor('file'))
  create(@UploadedFile() file: Express.Multer.File) {
    return this.s3Service.create(file)
  }

  @Get('presigned-url')
  async getPresignedUrl(@Query('key') key: string) {
    const { url } = await this.s3Service.generatePresignedUrl(key, 3600) // URL válida por 1 hora
    return { url }
  }
}
