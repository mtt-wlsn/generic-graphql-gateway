import './tracing/trace.provider';
import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const gateway = await NestFactory.create(GatewayModule);
  await gateway.listen(process.env.GATEWAY_PORT ?? 3000);
}
bootstrap();
