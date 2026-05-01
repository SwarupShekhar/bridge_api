import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { BridgeProxyService } from './bridge-proxy.service';
import { ClerkAuthService } from './clerk-auth.service';

interface UpdateLastActiveDto {
  app: 'CORE' | 'PULSE';
}

interface SyncCefrDto {
  cefrLevel: string;
  fluencyScore?: number;
  source?: string;
}

@Controller('api/bridge')
export class BridgeProxyController {
  private readonly logger = new Logger(BridgeProxyController.name);

  constructor(
    private readonly bridgeProxyService: BridgeProxyService,
    private readonly clerkAuthService: ClerkAuthService,
  ) {}

  @Post('last-active')
  @HttpCode(HttpStatus.OK)
  async updateLastActive(
    @Body() body: UpdateLastActiveDto,
    @Headers('authorization') authHeader: string,
  ): Promise<{ status: string; message: string }> {
    const clerkId = await this.clerkAuthService.verifyTokenAndGetUserId(authHeader);
    
    this.logger.log(`Received last-active update request for user ${clerkId}: ${body.app}`);

    try {
      await this.bridgeProxyService.updateLastActive(clerkId, body.app);
      
      return {
        status: 'success',
        message: `Last active app updated to ${body.app} for user ${clerkId}`,
      };
    } catch (error) {
      this.logger.error(`Error updating last active app for user ${clerkId}:`, error);
      throw error;
    }
  }

  @Post('sync-cefr')
  @HttpCode(HttpStatus.OK)
  async syncCefr(
    @Body() body: SyncCefrDto,
    @Headers('authorization') authHeader: string,
  ): Promise<{ status: string; message: string }> {
    const clerkId = await this.clerkAuthService.verifyTokenAndGetUserId(authHeader);
    
    this.logger.log(`Received CEFR sync request for user ${clerkId}: ${body.cefrLevel}`);

    try {
      await this.bridgeProxyService.syncCefr(clerkId, body.cefrLevel, body.fluencyScore, body.source);
      
      return {
        status: 'success',
        message: `CEFR level ${body.cefrLevel} synced for user ${clerkId}`,
      };
    } catch (error) {
      this.logger.error(`Error syncing CEFR for user ${clerkId}:`, error);
      throw error;
    }
  }

  @Post('streak')
  @HttpCode(HttpStatus.OK)
  async incrementStreak(
    @Headers('authorization') authHeader: string,
  ): Promise<{ status: string; message: string }> {
    const clerkId = await this.clerkAuthService.verifyTokenAndGetUserId(authHeader);
    
    this.logger.log(`Received streak increment request for user ${clerkId}`);

    try {
      await this.bridgeProxyService.incrementStreak(clerkId);
      
      return {
        status: 'success',
        message: `Streak incremented for user ${clerkId}`,
      };
    } catch (error) {
      this.logger.error(`Error incrementing streak for user ${clerkId}:`, error);
      throw error;
    }
  }

  @Post('minutes')
  @HttpCode(HttpStatus.OK)
  async addPracticeMinutes(
    @Body() body: { minutes: number },
    @Headers('authorization') authHeader: string,
  ): Promise<{ status: string; message: string }> {
    const clerkId = await this.clerkAuthService.verifyTokenAndGetUserId(authHeader);
    
    this.logger.log(`Received practice minutes request for user ${clerkId}: ${body.minutes} minutes`);

    try {
      await this.bridgeProxyService.addPracticeMinutes(clerkId, body.minutes);
      
      return {
        status: 'success',
        message: `Added ${body.minutes} practice minutes for user ${clerkId}`,
      };
    } catch (error) {
      this.logger.error(`Error adding practice minutes for user ${clerkId}:`, error);
      throw error;
    }
  }
}
