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
import * as pino from 'pino';
import {
  LoggerModuleOptions,
  LoggerModuleAsyncOptions,
  LoggerOptionsFactory,
} from './interfaces';
import { LogManager } from './log-manager';
import { LOGGER_MODULE_OPTIONS } from './logger.constants';
import { RouteInfo, Type } from '@nestjs/common/interfaces';

@Global()
@Module({})
export class LoggerCoreModule implements NestModule {
  private readonly httpLogger: boolean;
  private readonly httpLoggerName: string;
  private readonly httpLoggerRoutes: (string | Type<any> | RouteInfo)[];
  private readonly httpLoggerExclude?: (string | RouteInfo)[];

  constructor(
    @Inject(LOGGER_MODULE_OPTIONS)
    {
      httpLogger = true,
      httpLoggerName = 'http',
      httpLoggerRoutes = [{ path: '*', method: RequestMethod.ALL }],
      httpLoggerExclude,
      registerExitHandler = true,
    }: LoggerModuleOptions,
    private readonly logManager: LogManager,
    @Optional() private readonly httpAdapterHost: HttpAdapterHost,
  ) {
    this.httpLogger = httpLogger;
    this.httpLoggerName = httpLoggerName;
    this.httpLoggerRoutes = httpLoggerRoutes;
    this.httpLoggerExclude = httpLoggerExclude;

    if (registerExitHandler) {
      const handler = pino.final(
        logManager.getLogger(),
        (err, finalLogger, evt) => {
          finalLogger.info(`${evt} caught`);
          if (err) {
            finalLogger.error(err, 'error caused exit');
          }
          process.exit(err ? 1 : 0);
        },
      );

      process.on('beforeExit', () => handler(null, 'beforeExit'));
      process.on('exit', () => handler(null, 'exit'));
      process.on('uncaughtException', err => handler(err, 'uncaughtException'));
      process.on('unhandledRejection', (reason, promise) =>
        handler(reason as any, 'unhandledRejection'),
      );
      process.on('SIGINT', () => handler(null, 'SIGINT'));
      process.on('SIGQUIT', () => handler(null, 'SIGQUIT'));
      process.on('SIGTERM', () => handler(null, 'SIGTERM'));
    }
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
        () => require('pino-http'),
      );
      let middlewareConfigProxy = consumer.apply(
        pinoHttp({ logger: this.logManager.getLogger(this.httpLoggerName) }),
      );

      if (this.httpLoggerExclude && this.httpLoggerExclude.length) {
        middlewareConfigProxy = middlewareConfigProxy.exclude(
          ...this.httpLoggerExclude,
        );
      }

      middlewareConfigProxy.forRoutes(...this.httpLoggerRoutes);
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
    const inject = [
      (options.useClass || options.useExisting) as Type<LoggerOptionsFactory>,
    ];
    return {
      provide: LOGGER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: LoggerOptionsFactory) =>
        await optionsFactory.createLoggerOptions(),
      inject,
    };
  }
}
