import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BridgeProxyService {
  private readonly logger = new Logger(BridgeProxyService.name);
  private readonly bridgeBaseUrl: string;
  private readonly bridgeInternalSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.bridgeBaseUrl = this.configService.get<string>('BRIDGE_API_URL') || 'http://localhost:3012';
    this.bridgeInternalSecret = this.configService.get<string>('BRIDGE_INTERNAL_SECRET');
    
    if (!this.bridgeInternalSecret) {
      this.logger.error('BRIDGE_INTERNAL_SECRET environment variable not set');
    } else {
      this.logger.log('Bridge proxy service initialized with internal secret');
    }
  }

  async updateLastActive(clerkId: string, app: 'CORE' | 'PULSE'): Promise<void> {
    this.logger.log(`Updating last active app to ${app} for user ${clerkId}`);
    
    const url = `${this.bridgeBaseUrl}/user/${clerkId}`;
    const headers = {
      'x-internal-secret': this.bridgeInternalSecret,
      'Content-Type': 'application/json',
    };

    try {
      await this.httpService.axiosRef.patch(url, {
        lastActiveApp: app,
      }, { headers });

      this.logger.log(`Successfully updated last active app to ${app} for user ${clerkId}`);
    } catch (error) {
      this.logger.error(`Failed to update last active app for user ${clerkId}:`, error);
      throw error;
    }
  }

  async syncCefr(clerkId: string, cefrLevel: string, fluencyScore?: number, source?: string): Promise<void> {
    this.logger.log(`Syncing CEFR level ${cefrLevel} for user ${clerkId} from ${source || 'unknown'}`);
    
    const url = `${this.bridgeBaseUrl}/sync/cefr`;
    const headers = {
      'x-internal-secret': this.bridgeInternalSecret,
      'Content-Type': 'application/json',
    };

    const body = {
      clerkId,
      cefrLevel,
      fluencyScore: fluencyScore || 0,
      source: source || 'CORE',
    };

    try {
      await this.httpService.axiosRef.patch(url, body, { headers });

      this.logger.log(`Successfully synced CEFR level ${cefrLevel} for user ${clerkId}`);
    } catch (error) {
      this.logger.error(`Failed to sync CEFR for user ${clerkId}:`, error);
      throw error;
    }
  }

  async incrementStreak(clerkId: string): Promise<void> {
    this.logger.log(`Incrementing streak for user ${clerkId}`);
    
    const url = `${this.bridgeBaseUrl}/user/${clerkId}/streak`;
    const headers = {
      'x-internal-secret': this.bridgeInternalSecret,
      'Content-Type': 'application/json',
    };

    try {
      await this.httpService.axiosRef.patch(url, {}, { headers });

      this.logger.log(`Successfully incremented streak for user ${clerkId}`);
    } catch (error) {
      this.logger.error(`Failed to increment streak for user ${clerkId}:`, error);
      throw error;
    }
  }

  async addPracticeMinutes(clerkId: string, minutes: number): Promise<void> {
    this.logger.log(`Adding ${minutes} practice minutes for user ${clerkId}`);
    
    const url = `${this.bridgeBaseUrl}/user/${clerkId}/minutes`;
    const headers = {
      'x-internal-secret': this.bridgeInternalSecret,
      'Content-Type': 'application/json',
    };

    try {
      await this.httpService.axiosRef.patch(url, { minutes }, { headers });

      this.logger.log(`Successfully added ${minutes} practice minutes for user ${clerkId}`);
    } catch (error) {
      this.logger.error(`Failed to add practice minutes for user ${clerkId}:`, error);
      throw error;
    }
  }
}
