import { Test, TestingModule } from '@nestjs/testing';
import { BridgeProxyService } from './bridge-proxy.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('BridgeProxyService', () => {
  let service: BridgeProxyService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockHttpService = {
      axiosRef: {
        patch: jest.fn(),
      },
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'BRIDGE_API_URL') return 'http://localhost:3012';
        if (key === 'BRIDGE_INTERNAL_SECRET') return 'test-secret';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BridgeProxyService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BridgeProxyService>(BridgeProxyService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLastActive', () => {
    it('should call Bridge API to update last active app', async () => {
      const mockPatch = jest.spyOn(httpService.axiosRef, 'patch').mockResolvedValue({});

      await service.updateLastActive('user_123', 'CORE');

      expect(mockPatch).toHaveBeenCalledWith(
        'http://localhost:3012/user/user_123',
        { lastActiveApp: 'CORE' },
        {
          headers: {
            'x-internal-secret': 'test-secret',
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('syncCefr', () => {
    it('should call Bridge API to sync CEFR level', async () => {
      const mockPatch = jest.spyOn(httpService.axiosRef, 'patch').mockResolvedValue({});

      await service.syncCefr('user_123', 'B1', 75, 'CORE');

      expect(mockPatch).toHaveBeenCalledWith(
        'http://localhost:3012/sync/cefr',
        {
          clerkId: 'user_123',
          cefrLevel: 'B1',
          fluencyScore: 75,
          source: 'CORE',
        },
        {
          headers: {
            'x-internal-secret': 'test-secret',
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should use default values for optional parameters', async () => {
      const mockPatch = jest.spyOn(httpService.axiosRef, 'patch').mockResolvedValue({});

      await service.syncCefr('user_123', 'A1');

      expect(mockPatch).toHaveBeenCalledWith(
        'http://localhost:3012/sync/cefr',
        {
          clerkId: 'user_123',
          cefrLevel: 'A1',
          fluencyScore: 0,
          source: 'CORE',
        },
        {
          headers: {
            'x-internal-secret': 'test-secret',
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('incrementStreak', () => {
    it('should call Bridge API to increment streak', async () => {
      const mockPatch = jest.spyOn(httpService.axiosRef, 'patch').mockResolvedValue({});

      await service.incrementStreak('user_123');

      expect(mockPatch).toHaveBeenCalledWith(
        'http://localhost:3012/user/user_123/streak',
        {},
        {
          headers: {
            'x-internal-secret': 'test-secret',
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('addPracticeMinutes', () => {
    it('should call Bridge API to add practice minutes', async () => {
      const mockPatch = jest.spyOn(httpService.axiosRef, 'patch').mockResolvedValue({});

      await service.addPracticeMinutes('user_123', 30);

      expect(mockPatch).toHaveBeenCalledWith(
        'http://localhost:3012/user/user_123/minutes',
        { minutes: 30 },
        {
          headers: {
            'x-internal-secret': 'test-secret',
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });
});
