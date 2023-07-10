import type { KoaContext } from '../context';

export default function listAccounts(ctx: KoaContext<{ hello: 'world' }>) {
  ctx.status = 200;
  ctx.body = { hello: 'world' };
}
