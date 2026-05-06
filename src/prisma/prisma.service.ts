import { Injectable, OnModuleInit, OnModuleDestroy, Logger, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name);
  private connectionRetries = 0;
  private maxRetries = 3;
  private isConnecting = false;
  private keepaliveInterval?: NodeJS.Timeout;
  private isProperlyConnected = false;

  constructor() {
    const baseUrl = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('sslmode')
      ? `${process.env.DATABASE_URL}?sslmode=require`
      : process.env.DATABASE_URL;

    const isNeon = baseUrl.includes('neon.tech') || baseUrl.includes('pooler');
    const hasConnectionLimit = baseUrl.includes('connection_limit=');
    const hasPoolTimeout = baseUrl.includes('pool_timeout=');
    const hasKeepalive = baseUrl.includes('tcp_keepalives_idle=');
    const hasPgbouncer = baseUrl.includes('pgbouncer=');

    let connectionUrl = baseUrl;
    
    if (isNeon) {
      const paramSeparator = baseUrl.includes('?') ? '&' : '?';
      const params: string[] = [];
      
      if (!hasConnectionLimit) params.push('connection_limit=1');
      if (!hasPoolTimeout) params.push('pool_timeout=3');
      if (!hasKeepalive) {
        params.push('tcp_keepalives_idle=30');
        params.push('tcp_keepalives_interval=10');
        params.push('tcp_keepalives_count=5');
      }
      if (!hasPgbouncer) params.push('pgbouncer=true');
      
      if (params.length > 0) {
        connectionUrl = `${baseUrl}${paramSeparator}${params.join('&')}`;
      }
    }

    super({
      log: ['info', 'warn', 'error'],
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
    });
  }

  async onModuleInit() {
    this.logger.log('PrismaService initialized - will connect on first query');
    this.keepaliveInterval = setInterval(() => {
      this.keepConnectionAlive().catch(err => {
        this.logger.debug('Keepalive ping failed, will reconnect on next query:', err.message);
      });
    }, 4 * 60 * 1000);
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
        this.isProperlyConnected = true;
        return;
      } catch (error: any) {
        this.connectionRetries++;
        this.logger.error(`Database connection attempt ${this.connectionRetries} failed:`, error.message);
        
        if (this.connectionRetries >= this.maxRetries) {
          this.logger.error('Max connection retries reached. Database will be available on first query.');
          this.connectionRetries = 0;
          this.isConnecting = false;
          this.isProperlyConnected = false;
          return;
        }
        
        await this.delay(2000 * this.connectionRetries);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async keepConnectionAlive(): Promise<void> {
    try {
      if (this.isProperlyConnected) {
        await this.$queryRaw`SELECT 1`;
        this.logger.debug('Keepalive ping successful');
      }
    } catch (error) {
      this.isProperlyConnected = false;
      this.logger.debug('Keepalive ping failed, connection likely closed');
    }
  }

  async onModuleDestroy() {
    this.cleanup();
    this.logger.log('Prisma module destroyed');
  }

  async onApplicationShutdown() {
    this.cleanup();
    this.logger.log('Application shutdown complete');
  }

  private cleanup() {
    if (this.keepaliveInterval) {
      clearInterval(this.keepaliveInterval);
      this.keepaliveInterval = undefined;
    }
    try {
      if (this.isProperlyConnected) {
        this.$disconnect().catch(() => {});
      }
    } catch {
      // ignore cleanup errors
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error: any) {
      this.logger.error('Database health check failed:', error.message);
      await this.connectWithRetry();
      return false;
    }
  }

  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.isProperlyConnected) {
      await this.connectWithRetry();
    }

    try {
      const result = await operation();
      this.isProperlyConnected = true;
      return result;
    } catch (error: any) {
      const errorString = JSON.stringify(error);
      const isConnectionError = 
        error.message?.includes('connection') || error.message?.includes('closed') || 
        error.message?.includes('database') || error.code === 'P1001' || 
        error.code === 'P1002' ||
        errorString.includes('kind: Closed') ||
        errorString.includes('ConnectionClosedError');

      if (isConnectionError) {
        this.logger.warn('Database connection lost, attempting to reconnect...', error.message);
        this.isProperlyConnected = false;
        try {
          await this.$disconnect();
        } catch {
          // ignore
        }
        await this.connectWithRetry();
        return await operation();
      }
      throw error;
    }
  }
}