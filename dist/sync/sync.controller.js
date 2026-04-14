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
var SyncController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const sync_service_1 = require("./sync.service");
let SyncController = SyncController_1 = class SyncController {
    constructor(syncService) {
        this.syncService = syncService;
        this.logger = new common_1.Logger(SyncController_1.name);
    }
    async updateCefr(body, internalSecret) {
        if (internalSecret !== process.env.INTERNAL_SECRET) {
            this.logger.warn('Invalid internal secret provided');
            throw new common_1.UnauthorizedException('Invalid internal secret');
        }
        this.logger.log(`Received CEFR update request for user ${body.clerkId} from ${body.source}`);
        try {
            const updatedUser = await this.syncService.syncCefr(body);
            const userCreated = updatedUser.createdAt.getTime() === updatedUser.updatedAt.getTime();
            return {
                status: 'success',
                message: userCreated
                    ? `Created new user ${body.clerkId} with CEFR level ${body.cefrLevel} from ${body.source}`
                    : `CEFR level updated to ${body.cefrLevel} for user ${body.clerkId}`,
                userCreated,
            };
        }
        catch (error) {
            this.logger.error(`Error updating CEFR for user ${body.clerkId}:`, error);
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    throw new common_1.NotFoundException(error.message);
                }
                if (error.message.includes('Invalid internal secret')) {
                    throw new common_1.UnauthorizedException(error.message);
                }
            }
            throw error;
        }
    }
    async updatePlan(body, internalSecret) {
        if (internalSecret !== process.env.INTERNAL_SECRET) {
            this.logger.warn('Invalid internal secret provided for plan sync');
            throw new common_1.UnauthorizedException('Invalid internal secret');
        }
        this.logger.log(`Received plan update request for user ${body.clerkId}: ${body.plan}`);
        try {
            await this.syncService.syncPlan(body);
            return {
                status: 'success',
                message: `Plan updated to ${body.plan} for user ${body.clerkId}`,
            };
        }
        catch (error) {
            this.logger.error(`Error updating plan for user ${body.clerkId}:`, error);
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    throw new common_1.NotFoundException(error.message);
                }
                if (error.message.includes('Invalid internal secret')) {
                    throw new common_1.UnauthorizedException(error.message);
                }
            }
            throw error;
        }
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, common_1.Patch)('cefr'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-internal-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "updateCefr", null);
__decorate([
    (0, common_1.Patch)('plan'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-internal-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "updatePlan", null);
exports.SyncController = SyncController = SyncController_1 = __decorate([
    (0, common_1.Controller)('sync'),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncController);
