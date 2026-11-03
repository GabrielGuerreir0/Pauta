import { afterAll, afterEach, describe, expect, it, jest } from '@jest/globals';
import { z } from 'zod';

import { request } from '@/services/http/client';
import { HttpError, shouldRetry } from '@/services/http/errors';

const payloadSchema = z.object({
  ok: z.boolean(),
});

const noWait = async () => undefined;

describe('shouldRetry', () => {
  it('repete GET quando o servidor falha', () => {
    const error = new HttpError('http', 'Falha HTTP 503.', 503);
    expect(shouldRetry('GET', error, 0, 2)).toBe(true);
  });

  it('não repete POST nem erro de validação', () => {
    const httpError = new HttpError('http', 'Falha HTTP 503.', 503);
    const parseError = new HttpError('parse', 'Resposta fora do formato esperado.', 200);
    expect(shouldRetry('POST', httpError, 0, 2)).toBe(false);
    expect(shouldRetry('GET', parseError, 0, 2)).toBe(false);
    expect(shouldRetry('GET', new HttpError('http', 'Falha HTTP 404.', 404), 0, 2)).toBe(false);
  });
});

describe('request', () => {
  const fetchMock = jest.spyOn(globalThis, 'fetch');

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    fetchMock.mockRestore();
  });

  it('valida o JSON e devolve o dado', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ ok: true }));

    await expect(
      request('https://example.test/hoje', payloadSchema, { wait: noWait }),
    ).resolves.toEqual({
      ok: true,
    });
  });

  it('tenta de novo depois de 503 e aceita a resposta seguinte', async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json({ message: 'indisponível' }, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ ok: true }));

    await expect(
      request('https://example.test/hoje', payloadSchema, { maxRetries: 2, wait: noWait }),
    ).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejeita corpo inválido sem nova tentativa', async () => {
    fetchMock.mockResolvedValue(Response.json({ ok: 'sim' }));

    await expect(
      request('https://example.test/hoje', payloadSchema, { maxRetries: 2, wait: noWait }),
    ).rejects.toMatchObject({
      name: 'HttpError',
      kind: 'parse',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
