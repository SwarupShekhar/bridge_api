"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeProxyModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const bridge_proxy_controller_1 = require("./bridge-proxy.controller");
const sessions_controller_1 = require("./sessions.controller");
const bridge_proxy_service_1 = require("./bridge-proxy.service");
const clerk_auth_service_1 = require("./clerk-auth.service");
let BridgeProxyModule = class BridgeProxyModule {
};
exports.BridgeProxyModule = BridgeProxyModule;
exports.BridgeProxyModule = BridgeProxyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            config_1.ConfigModule,
        ],
        controllers: [bridge_proxy_controller_1.BridgeProxyController, sessions_controller_1.SessionsController],
        providers: [bridge_proxy_service_1.BridgeProxyService, clerk_auth_service_1.ClerkAuthService],
        exports: [bridge_proxy_service_1.BridgeProxyService],
    })
], BridgeProxyModule);
