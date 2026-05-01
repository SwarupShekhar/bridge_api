import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            healthCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status with database connected', async () => {
    jest.spyOn(prismaService, 'healthCheck').mockResolvedValue(true);

    const result = await controller.getHealth();
    expect(result).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      service: 'bridge-api',
      version: expect.any(String),
      database: {
        connected: true,
        status: 'healthy',
      },
    });
  });

  it('should return degraded status when database disconnected', async () => {
    jest.spyOn(prismaService, 'healthCheck').mockResolvedValue(false);

    const result = await controller.getHealth();
    expect(result).toEqual({
      status: 'degraded',
      timestamp: expect.any(String),
      service: 'bridge-api',
      version: expect.any(String),
      database: {
        connected: false,
        status: 'unhealthy',
      },
    });
  });

  it('should return root message', () => {
    const result = controller.getRoot();
    expect(result).toHaveProperty('message', 'Bridge API is running');
    expect(result).toHaveProperty('timestamp');
  });
});
