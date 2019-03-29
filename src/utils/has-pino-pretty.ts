let pinoPretty = false;

try {
  require.resolve('pino-pretty');
  pinoPretty = true;
} catch {}

export const hasPinoPretty = pinoPretty;
