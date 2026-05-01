import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { BridgeProxyService } from './bridge-proxy.service';
import { ClerkAuthService } from './clerk-auth.service';

describe('SessionsController', () => {
  let controller: SessionsController;
  let bridgeProxyService: BridgeProxyService;
  let clerkAuthService: ClerkAuthService;

  beforeEach(async () => {
    const mockBridgeProxyService = {
      incrementStreak: jest.fn(),
      addPracticeMinutes: jest.fn(),
    };

    const mockClerkAuthService = {
      verifyTokenAndGetUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
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

    controller = module.get<SessionsController>(SessionsController);
    bridgeProxyService = module.get<BridgeProxyService>(BridgeProxyService);
    clerkAuthService = module.get<ClerkAuthService>(ClerkAuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      const body = { minutes: 45 };
      const clerkId = 'user_123';

      jest.spyOn(clerkAuthService, 'verifyTokenAndGetUserId').mockResolvedValue(clerkId);
      jest.spyOn(bridgeProxyService, 'addPracticeMinutes').mockResolvedValue();

      const result = await controller.addPracticeMinutes(body, authHeader);

      expect(clerkAuthService.verifyTokenAndGetUserId).toHaveBeenCalledWith(authHeader);
      expect(bridgeProxyService.addPracticeMinutes).toHaveBeenCalledWith(clerkId, 45);
      expect(result).toEqual({
        status: 'success',
        message: `Added 45 practice minutes for user ${clerkId}`,
      });
    });
  });
});
