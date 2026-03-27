import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
