import { Module } from '@nestjs/common'
import { S3Module } from './s3/s3.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    S3Module,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
