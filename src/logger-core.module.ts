import { HttpAdapterHost } from '@nestjs/core';
import {
  Global,
  Module,
  DynamicModule,
  Provider,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  Optional,
  Inject,
} from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import {
  LoggerModuleOptions,
  LoggerModuleAsyncOptions,
  LoggerOptionsFactory,
} from './interfaces';
import { LogManager } from './log-manager';
import { LOGGER_MODULE_OPTIONS } from './logger.constants';

@Global()
@Module({})
export class LoggerCoreModule implements NestModule {
  private readonly httpLogger: boolean;

  constructor(
    @Inject(LOGGER_MODULE_OPTIONS) { httpLogger = true }: LoggerModuleOptions,
    private readonly logManager: LogManager,
    @Optional() private readonly httpAdapterHost: HttpAdapterHost,
  ) {
    this.httpLogger = httpLogger;
  }

  configure(consumer: MiddlewareConsumer) {
    if (
      this.httpLogger &&
      this.httpAdapterHost &&
      this.httpAdapterHost.httpAdapter
    ) {
      const pinoHttp: typeof import('pino-http') = loadPackage(
        'pino-http',
        'LoggerCoreModule',
      );
      consumer
        .apply(pinoHttp({ logger: this.logManager.getLogger() }))
        .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
  }

  static forRoot(options: LoggerModuleOptions): DynamicModule {
    const logManagerProvider = {
      provide: LogManager,
      useValue: new LogManager(options),
    };

    return {
      module: LoggerCoreModule,
      providers: [
        logManagerProvider,
        { provide: LOGGER_MODULE_OPTIONS, useValue: options },
      ],
      exports: [logManagerProvider],
    };
  }

  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    const logManagerProvider = {
      provide: LogManager,
      useFactory: (loggerModuleOptions: LoggerModuleOptions) =>
        new LogManager(loggerModuleOptions),
      inject: [LOGGER_MODULE_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: LoggerCoreModule,
      imports: options.imports,
      providers: [...asyncProviders, logManagerProvider],
      exports: [logManagerProvider],
    };
  }

  private static createAsyncProviders(
    options: LoggerModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      options.useClass && {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ].filter(Boolean) as Provider[];
  }

  private static createAsyncOptionsProvider(
    options: LoggerModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: LOGGER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: LOGGER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: LoggerOptionsFactory) =>
        await optionsFactory.createLoggerOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
