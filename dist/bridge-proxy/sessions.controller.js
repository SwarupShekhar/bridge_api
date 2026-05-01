"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SessionsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const bridge_proxy_service_1 = require("./bridge-proxy.service");
const clerk_auth_service_1 = require("./clerk-auth.service");
let SessionsController = SessionsController_1 = class SessionsController {
    constructor(bridgeProxyService, clerkAuthService) {
        this.bridgeProxyService = bridgeProxyService;
        this.clerkAuthService = clerkAuthService;
        this.logger = new common_1.Logger(SessionsController_1.name);
    }
    async incrementStreak(authHeader) {
        const clerkId = await this.clerkAuthService.verifyTokenAndGetUserId(authHeader);
        this.logger.log(`Received streak increment request for user ${clerkId}`);
        try {
            await this.bridgeProxyService.incrementStreak(clerkId);
            return {
                status: 'success',
                message: `Streak incremented for user ${clerkId}`,
            };
        }
        catch (error) {
            this.logger.error(`Error incrementing streak for user ${clerkId}:`, error);
            throw error;
        }
    }
    async addPracticeMinutes(body, authHeader) {
        const clerkId = await this.clerkAuthService.verifyTokenAndGetUserId(authHeader);
        this.logger.log(`Received practice minutes request for user ${clerkId}: ${body.minutes} minutes`);
        try {
            await this.bridgeProxyService.addPracticeMinutes(clerkId, body.minutes);
            return {
                status: 'success',
                message: `Added ${body.minutes} practice minutes for user ${clerkId}`,
            };
        }
        catch (error) {
            this.logger.error(`Error adding practice minutes for user ${clerkId}:`, error);
            throw error;
        }
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Post)('streak'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "incrementStreak", null);
__decorate([
    (0, common_1.Post)('minutes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "addPracticeMinutes", null);
exports.SessionsController = SessionsController = SessionsController_1 = __decorate([
    (0, common_1.Controller)('sessions/bridge'),
    __metadata("design:paramtypes", [bridge_proxy_service_1.BridgeProxyService,
        clerk_auth_service_1.ClerkAuthService])
], SessionsController);
