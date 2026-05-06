import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Catch(Prisma.PrismaClientKnownRequestError)
@Injectable()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  constructor(private readonly prisma: PrismaService) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    this.logger.error(
      `Prisma error caught: ${exception.message} (code: ${exception.code})`,
      exception.stack,
    );

    const isConnectionError = 
      exception.code === 'P1001' ||
      exception.code === 'P1002' ||
      exception.message?.toLowerCase().includes('connection') ||
      exception.message?.toLowerCase().includes('closed') ||
      exception.message?.toLowerCase().includes('database');

    if (isConnectionError) {
      this.logger.warn('Connection error detected, triggering reconnection...');
      // Reconnection will happen automatically on next query
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = isConnectionError ? 503 : 500;

    response.status(status).json({
      statusCode: status,
      message: isConnectionError ? 'Database connection error' : 'Database query error',
      error: isConnectionError ? 'Database unavailable' : 'Internal server error',
    });
  }
}
