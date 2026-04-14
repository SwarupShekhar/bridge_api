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

interface UpdatePlanData {
  clerkId: string;
  plan: string;
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
      this.logger.warn(`User ${clerkId} not found in database. Creating new user with CEFR data from ${source}`);
      
      // Create new user with CEFR data
      const newUser = await this.prisma.sharedUser.create({
        data: {
          clerkId,
          email: `${clerkId}@placeholder.com`, // Placeholder email
          fullName: `User ${clerkId}`, // Placeholder name
          cefrLevel,
          fluencyScore,
          cefrUpdatedAt: new Date(),
          cefrUpdatedBy: source,
        },
      });

      this.logger.log(`Created new user ${clerkId} with CEFR level ${cefrLevel} from ${source}`);

      // Fire and forget cross-call to other backend
      this.notifyOtherBackend(data).catch((error) => {
        this.logger.error(`Failed to notify other backend for new user ${clerkId}:`, error);
      });

      return newUser;
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

  async syncPlan(data: UpdatePlanData): Promise<void> {
    const { clerkId, plan } = data;

    this.logger.log(`Received plan sync request for user ${clerkId}: ${plan}`);

    // Read current SharedUser from Prisma
    const existingUser = await this.prisma.sharedUser.findUnique({
      where: { clerkId },
    });

    if (!existingUser) {
      this.logger.warn(`User ${clerkId} not found in database. Creating new user with plan data`);
      
      // Create new user with plan data
      await this.prisma.sharedUser.create({
        data: {
          clerkId,
          email: `${clerkId}@placeholder.com`, // Placeholder email
          fullName: `User ${clerkId}`, // Placeholder name
          englivoPlan: plan === 'none' || plan === 'free' ? 'none' : plan, // Map plan to englivoPlan
          engrPlan: plan,
        },
      });

      this.logger.log(`Created new user ${clerkId} with plan ${plan}`);
      return;
    }

    // Check if plan data is actually different to avoid unnecessary updates
    const needsUpdate = 
      existingUser.engrPlan !== plan ||
      existingUser.englivoPlan !== plan;

    if (!needsUpdate) {
      this.logger.log(`Plan data unchanged for user ${clerkId}, skipping update`);
      return;
    }

    // Update sharedUser with new plan data
    await this.prisma.sharedUser.update({
      where: { clerkId },
      data: {
        englivoPlan: plan === 'none' || plan === 'free' ? 'none' : plan, // Map plan to englivoPlan
        engrPlan: plan,
      },
    });

    this.logger.log(`Updated plan to ${plan} for user ${clerkId}`);
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
