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
            return {
                status: 'success',
                message: `CEFR level updated to ${body.cefrLevel} for user ${body.clerkId}`,
            };
        }
        catch (error) {
            this.logger.error(`Error updating CEFR for user ${body.clerkId}:`, error);
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
exports.SyncController = SyncController = SyncController_1 = __decorate([
    (0, common_1.Controller)('sync'),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncController);
