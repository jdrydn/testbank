import _isPlainObject from 'lodash/isPlainObject';
import assert from 'http-assert-plus';
import { ValidationError } from 'yup';
import type { Next as NextFunction } from 'koa';

import type { KoaContext } from '../context';

export async function wrapErrorMiddleware(ctx: KoaContext, next: NextFunction) {
  try {
    // Continue through the rest of the router
    await next();

    // If no route was found, trigger a better/more-detailed 404 error
    assert.notStrictEqual(ctx.status, 404, 404, `Route not found: ${ctx.method} ${ctx.url}`, {
      code: 'RESOURCE_NOT_FOUND',
      silent: true,
    });

    ctx.log.info({ ctx });
  } catch (err: any) {
    const errors = formatErr(err);
    ctx.status = err.statusCode ?? err.status ?? 500;
    ctx.body = { errors };
    ctx.log.error({ ctx, err });
  }
}

export function formatErr(err: ValidationError | (Error & Record<string, unknown>)): Record<string, unknown>[] {
  if (err instanceof ValidationError) {
    console.error({ ...err });
    return err.inner.map(e => ({
      status: 400,
      title: 'A validation error occurred',
      detail: e.message,
      code: 'VALIDATION_ERROR',
      source: e.path ? { pointer: `/${e.path.replace(/\./g, '/')}` } : undefined,
    }));
  } else if (err.code === 'VALIDATION_ERROR') {
    return [ {
      id: typeof err.id === 'string' ? err.id : undefined,
      links: _isPlainObject(err.links) ? err.links : undefined,
      status: (typeof err.status === 'number' ? err.status : null)
        || (typeof err.statusCode === 'number' ? err.statusCode : null)
        || undefined,
      code: typeof err.code === 'string' || typeof err.code === 'number' ? `${err.code}` : undefined,
      title: err.title || undefined,
      detail: err.userMessage || err.message || `${err}`,
      source: _isPlainObject(err.source) ? err.source : undefined,
      meta: { fields: err.fields },
    } ];
  } else {
    return [ {
      id: typeof err.id === 'string' ? err.id : undefined,
      links: _isPlainObject(err.links) ? err.links : undefined,
      status: (typeof err.status === 'number' ? err.status : null)
        || (typeof err.statusCode === 'number' ? err.statusCode : null)
        || undefined,
      code: typeof err.code === 'string' || typeof err.code === 'number' ? `${err.code}` : undefined,
      title: err.title || undefined,
      detail: err.userMessage || err.message || `${err}`,
      source: _isPlainObject(err.source) ? err.source : undefined,
      meta: _isPlainObject(err.meta) ? err.meta : undefined,
    } ];
  }
}
