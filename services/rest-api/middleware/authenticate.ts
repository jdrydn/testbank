import assert from 'http-assert-plus';
import type { Next as NextFunction } from 'koa';

import { getTenantTokenByToken } from '@/modules/tenantTokens/model';
import type { KoaContext } from '../context';

export async function authenticate(ctx: KoaContext, next?: NextFunction) {
  const authHeader = ctx.get('Authorization');
  if (authHeader && authHeader.length) {
    const details = { code: 'NOT_AUTHENTICATED', userMessage: 'You must be authenticated' };

    const [authType, authToken] = authHeader.split(' ');
    assert.strictEqual(authType, 'Bearer', 401, 'Expected token to be a Bearer token', details);
    assert.ok(authToken.length === 32, 401, 'Expected token to be a 32-length string', details);

    const token = await getTenantTokenByToken(authToken);
    assert.ok(token?.id && token?.tenantId, 401, 'TenantToken not found', details);

    Object.assign(ctx.state, {
      tenantId: token.tenantId,
    });
  }

  return typeof next === 'function' ? next() : undefined;
}

export function requireAuth(ctx: KoaContext, next?: NextFunction) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Missing tenantId from state', {
    code: 'NOT_AUTHENTICATED',
    userMessage: 'You must be authenticated',
  });
  return typeof next === 'function' ? next() : undefined;
}
