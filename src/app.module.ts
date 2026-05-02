import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { PrismaModule } from "./prisma/prisma.module";
import { SharedUsersModule } from "./shared-users/shared-users.module";
import { WebhookModule } from "./webhook/webhook.module";
import { SyncModule } from "./sync/sync.module";
import { UserModule } from "./user/user.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    PrismaModule,
    SharedUsersModule,
    WebhookModule,
    SyncModule,
    UserModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
