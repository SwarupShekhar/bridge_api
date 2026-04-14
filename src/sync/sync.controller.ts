import { Controller, Patch, Body, Headers, HttpCode, HttpStatus, Logger, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { SyncService } from './sync.service';

interface UpdateCefrDto {
  clerkId: string;
  cefrLevel: string;
  fluencyScore: number;
  source: 'PULSE' | 'CORE';
}

interface UpdatePlanDto {
  clerkId: string;
  plan: string;
}

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private readonly syncService: SyncService) {}

  @Patch('cefr')
  @HttpCode(HttpStatus.OK)
  async updateCefr(
    @Body() body: UpdateCefrDto,
    @Headers('x-internal-secret') internalSecret: string,
  ): Promise<{ status: string; message: string; userCreated?: boolean }> {
    // Validate internal secret
    if (internalSecret !== process.env.INTERNAL_SECRET) {
      this.logger.warn('Invalid internal secret provided');
      throw new UnauthorizedException('Invalid internal secret');
    }

    this.logger.log(`Received CEFR update request for user ${body.clerkId} from ${body.source}`);

    try {
      const updatedUser = await this.syncService.syncCefr(body);
      
      // Check if user was newly created
      const userCreated = updatedUser.createdAt.getTime() === updatedUser.updatedAt.getTime();
      
      return {
        status: 'success',
        message: userCreated 
          ? `Created new user ${body.clerkId} with CEFR level ${body.cefrLevel} from ${body.source}`
          : `CEFR level updated to ${body.cefrLevel} for user ${body.clerkId}`,
        userCreated,
      };
    } catch (error) {
      this.logger.error(`Error updating CEFR for user ${body.clerkId}:`, error);
      
      // Re-throw with appropriate HTTP status
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new NotFoundException(error.message);
        }
        if (error.message.includes('Invalid internal secret')) {
          throw new UnauthorizedException(error.message);
        }
      }
      
      throw error;
    }
  }

  @Patch('plan')
  @HttpCode(HttpStatus.OK)
  async updatePlan(
    @Body() body: UpdatePlanDto,
    @Headers('x-internal-secret') internalSecret: string,
  ): Promise<{ status: string; message: string }> {
    // Validate internal secret
    if (internalSecret !== process.env.INTERNAL_SECRET) {
      this.logger.warn('Invalid internal secret provided for plan sync');
      throw new UnauthorizedException('Invalid internal secret');
    }

    this.logger.log(`Received plan update request for user ${body.clerkId}: ${body.plan}`);

    try {
      await this.syncService.syncPlan(body);
      
      return {
        status: 'success',
        message: `Plan updated to ${body.plan} for user ${body.clerkId}`,
      };
    } catch (error) {
      this.logger.error(`Error updating plan for user ${body.clerkId}:`, error);
      
      // Re-throw with appropriate HTTP status
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new NotFoundException(error.message);
        }
        if (error.message.includes('Invalid internal secret')) {
          throw new UnauthorizedException(error.message);
        }
      }
      
      throw error;
    }
  }
}
