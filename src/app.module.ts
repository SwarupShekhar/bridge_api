import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PrismaModule } from "./prisma/prisma.module";
import { SharedUsersModule } from "./shared-users/shared-users.module";
import { WebhookModule } from "./webhook/webhook.module";
import { SyncModule } from "./sync/sync.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    SharedUsersModule,
    WebhookModule,
    SyncModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
