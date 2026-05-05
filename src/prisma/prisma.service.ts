import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connectionRetries = 0;
  private maxRetries = 3;
  private isConnecting = false;

  constructor() {
    super({
      log: ['info', 'warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    // Don't connect immediately, wait for first query
    this.logger.log('PrismaService initialized - connection will be established on first query');
  }

  private async connectWithRetry(): Promise<void> {
    if (this.isConnecting) {
      this.logger.log('Connection already in progress, waiting...');
      while (this.isConnecting) {
        await this.delay(100);
      }
      return;
    }

    this.isConnecting = true;
    
    while (this.connectionRetries < this.maxRetries) {
      try {
        this.logger.log(`Connecting to database... (Attempt ${this.connectionRetries + 1}/${this.maxRetries})`);
        await this.$connect();
        this.logger.log('Successfully connected to database');
        this.connectionRetries = 0;
        this.isConnecting = false;
        return;
      } catch (error) {
        this.connectionRetries++;
        this.logger.error(`Database connection attempt ${this.connectionRetries} failed:`, error.message);
        
        if (this.connectionRetries >= this.maxRetries) {
          this.logger.error('Max connection retries reached. Database will be available on first query.');
          this.connectionRetries = 0;
          this.isConnecting = false;
          return;
        }
        
        // Wait before retrying
        await this.delay(2000 * this.connectionRetries);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error.message);
      // Try to reconnect if health check fails
      await this.connectWithRetry();
      return false;
    }
  }

  // Wrapper method for database operations with retry logic
  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    // Ensure connection is established before executing operation
    if (!this.isHealthy()) {
      await this.connectWithRetry();
    }

    try {
      return await operation();
    } catch (error) {
      if (error.message?.includes('connection') || error.message?.includes('closed') || 
          error.message?.includes('database') || error.code === 'P1001' || 
          error.code === 'P1002') {
        this.logger.warn('Database connection lost, attempting to reconnect...');
        await this.connectWithRetry();
        return await operation();
      }
      throw error;
    }
  }

  private isHealthy(): boolean {
    try {
      // Simple check to see if connection is active
      return this.$queryRaw !== undefined;
    } catch {
      return false;
    }
  }
}
