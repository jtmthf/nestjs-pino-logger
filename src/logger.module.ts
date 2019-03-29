import { Module, DynamicModule } from '@nestjs/common';
import { LoggerModuleOptions, LoggerModuleAsyncOptions } from './interfaces';
import { LoggerCoreModule } from './logger-core.module';

@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions = {}): DynamicModule {
    return {
      module: LoggerModule,
      imports: [LoggerCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [LoggerCoreModule.forRootAsync(options)],
    };
  }
}
