import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
@Injectable()
export class S3Service {
  private readonly s3: S3Client
  private readonly bucketName: string =
    this.configService.getOrThrow('AWS_BUCKET_NAME')
  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    })
  }

  async create(file: Express.Multer.File) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'max-age=31536000',
      Metadata: {
        filename: file.originalname,
        size: file.size.toString(),
        mimetype: file.mimetype,
        originalname: file.originalname,
        bucket: this.bucketName,
        key: `images/${Date.now()}-${file.originalname}`,
        region: this.configService.getOrThrow('AWS_REGION'),
      },
    })
    await this.s3.send(command)
    return {
      url: `https://${this.bucketName}.s3.amazonaws.com/${command.input.Key}`,
    }
  }

  // Generar una URL firmada para el archivo con un tiempo de expiración
  async generatePresignedUrl(key: string, expirationInSeconds: number = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    // Generar la URL presignada con el tiempo de expiración especificado
    const url = await getSignedUrl(this.s3, command, {
      expiresIn: expirationInSeconds, // Tiempo en segundos (3600 = 1 hora)
    })

    return { url }
  }
}
