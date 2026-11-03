type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const rank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minLevel: LogLevel = typeof __DEV__ !== 'undefined' && __DEV__ ? 'debug' : 'warn';

function write(level: LogLevel, message: string, detail?: unknown): void {
  if (rank[level] < rank[minLevel]) {
    return;
  }

  const payload = detail === undefined ? message : { message, detail };
  if (level === 'error') {
    console.error(payload);
    return;
  }
  if (level === 'warn') {
    console.warn(payload);
    return;
  }
  if (level === 'info') {
    console.info(payload);
    return;
  }
  console.debug(payload);
}

export const logger = {
  debug: (message: string, detail?: unknown) => write('debug', message, detail),
  info: (message: string, detail?: unknown) => write('info', message, detail),
  warn: (message: string, detail?: unknown) => write('warn', message, detail),
  error: (message: string, detail?: unknown) => write('error', message, detail),
};
