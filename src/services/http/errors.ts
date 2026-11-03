export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpErrorKind = 'timeout' | 'network' | 'http' | 'parse';

const RETRYABLE_METHODS = new Set<HttpMethod>(['GET', 'HEAD']);

export class HttpError extends Error {
  readonly kind: HttpErrorKind;
  readonly status: number | undefined;

  constructor(
    kind: HttpErrorKind,
    message: string,
    status?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'HttpError';
    this.kind = kind;
    this.status = status;
  }
}

export function shouldRetry(
  method: HttpMethod,
  error: HttpError,
  attempt: number,
  maxRetries: number,
): boolean {
  if (attempt >= maxRetries || !RETRYABLE_METHODS.has(method)) {
    return false;
  }
  if (error.kind === 'timeout' || error.kind === 'network') {
    return true;
  }
  if (error.kind === 'http' && error.status !== undefined) {
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }
  return false;
}

export function retryDelayMs(attempt: number): number {
  return 300 * 2 ** attempt;
}
