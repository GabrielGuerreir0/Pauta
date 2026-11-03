import type { ZodType } from 'zod';

import { logger } from '@/shared/logger';
import { HttpError, retryDelayMs, shouldRetry, type HttpMethod } from '@/services/http/errors';

export const DEFAULT_TIMEOUT_MS = 10_000;
export const DEFAULT_MAX_RETRIES = 2;

export type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  maxRetries?: number;
  signal?: AbortSignal;
  wait?: (ms: number) => Promise<void>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim().length === 0) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    throw new HttpError('parse', 'Resposta não é JSON válido.', response.status, { cause });
  }
}

async function executeOnce<T>(
  url: string,
  schema: ZodType<T>,
  options: RequestOptions & { method: HttpMethod; timeoutMs: number },
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs);

  const onAbort = () => {
    controller.abort();
  };

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', onAbort, { once: true });
    }
  }

  try {
    const headers = new Headers(options.headers);
    let body: string | undefined;
    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new HttpError('http', `Falha HTTP ${response.status}.`, response.status);
    }

    const raw = await readJson(response);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      throw new HttpError('parse', 'Resposta fora do formato esperado.', response.status, {
        cause: parsed.error,
      });
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    if (isAbortError(error)) {
      if (options.signal?.aborted) {
        throw new HttpError('network', 'Requisição cancelada.', undefined, { cause: error });
      }
      if (timedOut) {
        throw new HttpError('timeout', 'Tempo esgotado.', undefined, { cause: error });
      }
    }
    throw new HttpError('network', 'Falha de rede.', undefined, { cause: error });
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}

export async function request<T>(
  url: string,
  schema: ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET';
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const wait = options.wait ?? sleep;
  let attempt = 0;

  for (;;) {
    try {
      return await executeOnce(url, schema, { ...options, method, timeoutMs });
    } catch (error) {
      if (!(error instanceof HttpError) || !shouldRetry(method, error, attempt, maxRetries)) {
        throw error;
      }
      const delayMs = retryDelayMs(attempt);
      logger.warn('Nova tentativa HTTP.', { url, attempt, delayMs, kind: error.kind });
      await wait(delayMs);
      attempt += 1;
    }
  }
}
