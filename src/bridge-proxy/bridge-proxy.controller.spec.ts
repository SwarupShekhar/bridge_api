import { Test, TestingModule } from '@nestjs/testing';
import { BridgeProxyController } from './bridge-proxy.controller';
import { BridgeProxyService } from './bridge-proxy.service';
import { ClerkAuthService } from './clerk-auth.service';

describe('BridgeProxyController', () => {
  let controller: BridgeProxyController;
  let bridgeProxyService: BridgeProxyService;
  let clerkAuthService: ClerkAuthService;

  beforeEach(async () => {
    const mockBridgeProxyService = {
      updateLastActive: jest.fn(),
      syncCefr: jest.fn(),
      incrementStreak: jest.fn(),
      addPracticeMinutes: jest.fn(),
    };

    const mockClerkAuthService = {
      verifyTokenAndGetUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BridgeProxyController],
      providers: [
        {
          provide: BridgeProxyService,
          useValue: mockBridgeProxyService,
        },
        {
          provide: ClerkAuthService,
          useValue: mockClerkAuthService,
        },
      ],
    }).compile();

    controller = module.get<BridgeProxyController>(BridgeProxyController);
    bridgeProxyService = module.get<BridgeProxyService>(BridgeProxyService);
    clerkAuthService = module.get<ClerkAuthService>(ClerkAuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateLastActive', () => {
    it('should update last active app successfully', async () => {
      const authHeader = 'Bearer valid-token';
      const body = { app: 'CORE' as const };
      const clerkId = 'user_123';

      jest.spyOn(clerkAuthService, 'verifyTokenAndGetUserId').mockResolvedValue(clerkId);
      jest.spyOn(bridgeProxyService, 'updateLastActive').mockResolvedValue();

      const result = await controller.updateLastActive(body, authHeader);

      expect(clerkAuthService.verifyTokenAndGetUserId).toHaveBeenCalledWith(authHeader);
      expect(bridgeProxyService.updateLastActive).toHaveBeenCalledWith(clerkId, 'CORE');
      expect(result).toEqual({
        status: 'success',
        message: `Last active app updated to CORE for user ${clerkId}`,
      });
    });
  });

  describe('syncCefr', () => {
    it('should sync CEFR level successfully', async () => {
      const authHeader = 'Bearer valid-token';
      const body = { cefrLevel: 'B1', fluencyScore: 75, source: 'CORE' };
      const clerkId = 'user_123';

      jest.spyOn(clerkAuthService, 'verifyTokenAndGetUserId').mockResolvedValue(clerkId);
      jest.spyOn(bridgeProxyService, 'syncCefr').mockResolvedValue();

      const result = await controller.syncCefr(body, authHeader);

      expect(clerkAuthService.verifyTokenAndGetUserId).toHaveBeenCalledWith(authHeader);
      expect(bridgeProxyService.syncCefr).toHaveBeenCalledWith(clerkId, 'B1', 75, 'CORE');
      expect(result).toEqual({
        status: 'success',
        message: `CEFR level B1 synced for user ${clerkId}`,
      });
    });

    it('should sync CEFR level with optional parameters', async () => {
      const authHeader = 'Bearer valid-token';
      const body = { cefrLevel: 'A1' };
      const clerkId = 'user_123';

      jest.spyOn(clerkAuthService, 'verifyTokenAndGetUserId').mockResolvedValue(clerkId);
      jest.spyOn(bridgeProxyService, 'syncCefr').mockResolvedValue();

      const result = await controller.syncCefr(body, authHeader);

      expect(clerkAuthService.verifyTokenAndGetUserId).toHaveBeenCalledWith(authHeader);
      expect(bridgeProxyService.syncCefr).toHaveBeenCalledWith(clerkId, 'A1', undefined, undefined);
      expect(result).toEqual({
        status: 'success',
        message: `CEFR level A1 synced for user ${clerkId}`,
      });
    });
  });

  describe('incrementStreak', () => {
    it('should increment streak successfully', async () => {
      const authHeader = 'Bearer valid-token';
      const clerkId = 'user_123';

      jest.spyOn(clerkAuthService, 'verifyTokenAndGetUserId').mockResolvedValue(clerkId);
      jest.spyOn(bridgeProxyService, 'incrementStreak').mockResolvedValue();

      const result = await controller.incrementStreak(authHeader);

      expect(clerkAuthService.verifyTokenAndGetUserId).toHaveBeenCalledWith(authHeader);
      expect(bridgeProxyService.incrementStreak).toHaveBeenCalledWith(clerkId);
      expect(result).toEqual({
        status: 'success',
        message: `Streak incremented for user ${clerkId}`,
      });
    });
  });

  describe('addPracticeMinutes', () => {
    it('should add practice minutes successfully', async () => {
      const authHeader = 'Bearer valid-token';
      const body = { minutes: 30 };
      const clerkId = 'user_123';

      jest.spyOn(clerkAuthService, 'verifyTokenAndGetUserId').mockResolvedValue(clerkId);
      jest.spyOn(bridgeProxyService, 'addPracticeMinutes').mockResolvedValue();

      const result = await controller.addPracticeMinutes(body, authHeader);

      expect(clerkAuthService.verifyTokenAndGetUserId).toHaveBeenCalledWith(authHeader);
      expect(bridgeProxyService.addPracticeMinutes).toHaveBeenCalledWith(clerkId, 30);
      expect(result).toEqual({
        status: 'success',
        message: `Added 30 practice minutes for user ${clerkId}`,
      });
    });
  });
});
