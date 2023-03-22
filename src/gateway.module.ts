import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { RemoteGraphQLDataSource } from '@apollo/gateway';
import * as fetcher from 'make-fetch-happen';

export class CustomDataSource extends RemoteGraphQLDataSource {
  constructor(config: any) {
    super(config);
    this.fetcher = fetcher.defaults({
      maxSockets: Infinity,
      strictSSL: false,
      retry: false,
    });
  }
}
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      server: {
        cors: true,
        playground: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
      },
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: 'inventory',
              url: `http://localhost:${process.env.INVENTORY_PORT}/graphql`,
            },
            {
              name: 'shipping',
              url: `https://localhost:${process.env.SHIPPING_PORT}/graphql`,
            },
          ],
        }),
        buildService: ({ url }) =>
          new CustomDataSource({
            url,
            willSendRequest: ({ request, context }) => {
              if (context?.req?.headers) {
                for (const [headerKey, headerValue] of Object.entries(
                  context?.req?.headers,
                )) {
                  request.http?.headers.set(headerKey, headerValue);
                }
              }
            },
          }),
      },
    }),
  ],
  controllers: [GatewayController],
})
export class GatewayModule {}
