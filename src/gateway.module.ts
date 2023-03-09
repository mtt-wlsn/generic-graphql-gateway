import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [GatewayController],
})
export class GatewayModule {}
