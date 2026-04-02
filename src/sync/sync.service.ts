import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { SharedUser } from '@prisma/client';

interface UpdateCefrData {
  clerkId: string;
  cefrLevel: string;
  fluencyScore: number;
  source: 'PULSE' | 'CORE';
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async syncCefr(data: UpdateCefrData): Promise<SharedUser> {
    const { clerkId, cefrLevel, fluencyScore, source } = data;

    // Read current SharedUser from Prisma
    const existingUser = await this.prisma.sharedUser.findUnique({
      where: { clerkId },
    });

    if (!existingUser) {
      throw new Error(`SharedUser with clerkId ${clerkId} not found`);
    }

    // Only update if incoming cefrLevel is different from current
    if (existingUser.cefrLevel === cefrLevel) {
      this.logger.log(`CEFR level unchanged for user ${clerkId}, skipping update`);
      return existingUser;
    }

    // Update sharedUser with new CEFR data
    const updatedUser = await this.prisma.sharedUser.update({
      where: { clerkId },
      data: {
        cefrLevel,
        fluencyScore,
        cefrUpdatedAt: new Date(),
        cefrUpdatedBy: source,
      },
    });

    // Fire and forget cross-call to other backend
    this.notifyOtherBackend(data).catch((error) => {
      this.logger.error(`Failed to notify other backend for user ${clerkId}:`, error);
    });

    return updatedUser;
  }

  private async notifyOtherBackend(data: UpdateCefrData): Promise<void> {
    const { clerkId, cefrLevel, fluencyScore, source } = data;
    
    // Determine which backend to call - PULSE notifies CORE, CORE notifies PULSE
    const targetUrl = source === 'PULSE' 
      ? process.env.CORE_INTERNAL_URL 
      : process.env.PULSE_INTERNAL_URL;

    if (!targetUrl) {
      throw new Error(`Target backend URL not configured for source: ${source}`);
    }

    const endpoint = `${targetUrl}/api/internal/update-cefr`;
    const internalSecret = process.env.INTERNAL_SECRET;

    if (!internalSecret) {
      throw new Error('INTERNAL_SECRET environment variable not set');
    }

    try {
      this.logger.debug(`Calling URL: ${endpoint}`);
      await this.httpService.axiosRef.patch(endpoint, {
        clerkId,
        cefrLevel,
        fluencyScore,
        source,
      }, {
        headers: {
          'x-internal-secret': internalSecret,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Successfully notified other backend (${source === 'PULSE' ? 'CORE' : 'PULSE'}) for user ${clerkId}`);
    } catch (error) {
      this.logger.error(`Failed to call ${endpoint}:`, error);
      throw error;
    }
  }
}
