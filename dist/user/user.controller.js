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
var UserController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_dto_1 = require("./user.dto");
let UserController = UserController_1 = class UserController {
    constructor(userService) {
        this.userService = userService;
        this.logger = new common_1.Logger(UserController_1.name);
    }
    validateInternalSecret(internalSecret) {
        const expectedSecret = process.env.INTERNAL_SECRET;
        this.logger.debug(`Received secret: "${internalSecret}"`);
        this.logger.debug(`Expected secret: "${expectedSecret}"`);
        if (internalSecret !== expectedSecret) {
            this.logger.warn("Invalid internal secret provided");
            throw new common_1.UnauthorizedException("Invalid internal secret");
        }
    }
    getUserAgent(req) {
        return req.headers['user-agent'] || 'Unknown';
    }
    async getUser(clerkId, internalSecret, req) {
        this.logger.log(`GET /user/${clerkId} - User-Agent: ${req.headers['user-agent'] || 'Unknown'} - IP: ${req.ip}`);
        this.validateInternalSecret(internalSecret);
        return this.userService.getUser(clerkId);
    }
    async updateUser(clerkId, dto, internalSecret) {
        this.validateInternalSecret(internalSecret);
        return this.userService.updateUser(clerkId, dto);
    }
    async incrementStreak(clerkId, internalSecret) {
        this.validateInternalSecret(internalSecret);
        return this.userService.incrementStreak(clerkId);
    }
    async addPracticeMinutes(clerkId, dto, internalSecret) {
        this.validateInternalSecret(internalSecret);
        return this.userService.addPracticeMinutes(clerkId, dto.minutes);
    }
};
exports.UserController = UserController;
__decorate([
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", String)
], UserController.prototype, "getUserAgent", null);
__decorate([
    (0, common_1.Get)(":clerkId"),
    __param(0, (0, common_1.Param)("clerkId")),
    __param(1, (0, common_1.Headers)("x-internal-secret")),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.Patch)(":clerkId"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)("clerkId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)("x-internal-secret")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)(":clerkId/streak"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)("clerkId")),
    __param(1, (0, common_1.Headers)("x-internal-secret")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "incrementStreak", null);
__decorate([
    (0, common_1.Patch)(":clerkId/minutes"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)("clerkId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)("x-internal-secret")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.AddMinutesDto, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addPracticeMinutes", null);
exports.UserController = UserController = UserController_1 = __decorate([
    (0, common_1.Controller)("user"),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
