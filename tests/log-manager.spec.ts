import { Injectable } from '@nestjs/common';
import * as pino from 'pino';

import { LogManager } from '../src';

describe('default log manager', () => {
  it('creates a single root logger by default', () => {
    const logManager = new LogManager();

    expect(logManager.exists()).toBe(true);
    expect(logManager.exists('')).toBe(true);
    expect(logManager.exists('test')).toBe(false);
    expect(logManager.exists(TestService)).toBe(false);
  });

  it('creates a logger on getLogger', () => {
    const logManager = new LogManager();

    expect((logManager.getLogger() as any).bindings()).toEqual({});
    expect((logManager.getLogger('') as any).bindings()).toEqual({});
    expect((logManager.getLogger('test') as any).bindings()).toEqual({
      name: 'test',
    });
    expect((logManager.getLogger(TestService) as any).bindings()).toEqual({
      name: 'TestService',
    });
  });

  it('calls to getLogger are idempotent', () => {
    const logManager = new LogManager();

    expect(logManager.getLogger()).toBe(logManager.getLogger(''));
    expect(logManager.getLogger('test')).toBe(logManager.getLogger('test'));
    expect(logManager.getLogger(TestService)).toBe(
      logManager.getLogger(TestService),
    );
    expect(logManager.getLogger('test')).not.toBe(logManager.getLogger());
  });

  it('loggers can be replaced', () => {
    const logManager = new LogManager();

    expect(logManager.getLogger()).not.toBe(
      logManager.getLogger('', undefined, true),
    );
    expect(logManager.getLogger('test')).not.toBe(
      logManager.getLogger('test', undefined, true),
    );
    expect(logManager.getLogger(TestService)).not.toBe(
      logManager.getLogger(TestService, undefined, true),
    );
  });

  it('level is silent by default in tests', () => {
    const logManager = new LogManager();

    expect(logManager.getLogger().level).toBe('silent');
    expect(logManager.getLogger('test').level).toBe('silent');
    expect(logManager.getLogger(TestService).level).toBe('silent');
  });

  it('options passed to getLogger override the defaults', () => {
    const logManager = new LogManager();

    expect(logManager.getLogger('', { level: 'fatal' }, true).level).toBe(
      'fatal',
    );
    expect(logManager.getLogger('test', { level: 'error' }).level).toBe(
      'error',
    );
    expect(logManager.getLogger(TestService, { level: 'warn' }).level).toBe(
      'warn',
    );
  });
});

describe('extreme mode', () => {
  it('can set extreme mode', () => {
    const spy = jest.spyOn(pino, 'extreme');
    const logManager = new LogManager({ extreme: true });

    expect(spy).toHaveBeenCalledTimes(1);

    logManager.getLogger('test');
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('by default flushes logs on an interval when in extreme mode', () => {
    jest.useFakeTimers();
    const logManager = new LogManager({ extreme: true });

    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 10000);

    const flushMock = jest.fn();
    logManager.getLogger().flush = flushMock;

    jest.runOnlyPendingTimers();

    expect(flushMock).toHaveBeenCalledTimes(1);
  });
});

@Injectable()
class TestService {
  logger: pino.Logger;

  constructor(logManager: LogManager) {
    this.logger = logManager.getLogger(TestService);
  }
}
