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
var ClerkWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkWebhookController = void 0;
const common_1 = require("@nestjs/common");
const clerk_webhook_service_1 = require("./clerk-webhook.service");
let ClerkWebhookController = ClerkWebhookController_1 = class ClerkWebhookController {
    constructor(clerkWebhookService) {
        this.clerkWebhookService = clerkWebhookService;
        this.logger = new common_1.Logger(ClerkWebhookController_1.name);
    }
    async handleClerkWebhook(event) {
        this.logger.log(`Received Clerk webhook event: ${event.type}`);
        try {
            switch (event.type) {
                case 'user.created':
                    await this.clerkWebhookService.handleUserCreated(event);
                    break;
                default:
                    this.logger.log(`Ignoring unhandled event type: ${event.type}`);
                    break;
            }
            return { status: 'processed' };
        }
        catch (error) {
            this.logger.error(`Error processing webhook event ${event.type}:`, error);
            throw error;
        }
    }
};
exports.ClerkWebhookController = ClerkWebhookController;
__decorate([
    (0, common_1.Post)('clerk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClerkWebhookController.prototype, "handleClerkWebhook", null);
exports.ClerkWebhookController = ClerkWebhookController = ClerkWebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [clerk_webhook_service_1.ClerkWebhookService])
], ClerkWebhookController);
