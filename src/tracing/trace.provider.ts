import { FilteredConsoleSpanExporter } from './filteredConsoleSpanExporter';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';

class TracerProvider {
  private readonly _provider: NodeTracerProvider;

  constructor() {
    this._provider = new NodeTracerProvider();

    // this._provider.addSpanProcessor(
    //   new SimpleSpanProcessor(new ConsoleSpanExporter()),
    // );

    this._provider.addSpanProcessor(
      new SimpleSpanProcessor(new FilteredConsoleSpanExporter()),
    );

    registerInstrumentations({
      tracerProvider: this._provider,
      instrumentations: [
        // new GraphQLInstrumentation({
        //   ignoreTrivialResolveSpans: true,
        // }),
        new HttpInstrumentation({
          requestHook: (span, request) => {
            let body = '';
            request.on('data', (chunk) => {
              body += chunk;
            });
            request.on('end', () => {
              span.setAttribute('http.request.body', body);
            });
          },
          responseHook: (span, response) => {
            let body = '';
            response.on('data', (chunk) => {
              body += chunk;
            });
            response.on('end', () => {
              span.setAttribute('http.response.body', body);
            });
          },
        }),
      ],
    });

    this._provider.register();

    diag.setLogger(
      new DiagConsoleLogger(),
      DiagLogLevel[DiagLogLevel.ALL.toString()],
    );
  }
}

export const tracer = new TracerProvider();
