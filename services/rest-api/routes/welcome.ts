import type { JsonApiRoot } from 'jsonapi-resolvers';

import { version } from '../package.json';
import type { KoaContext } from '../context';

export { version };

export default function welcomeRoute(ctx: KoaContext<Pick<JsonApiRoot, 'meta' | 'links'>>): void {
  const { tenantId } = ctx.state;

  ctx.status = 200;
  ctx.body = {
    meta: {
      name: 'Testbank API',
      version,
    },

    links: ctx.resolve.links({
      self: '/',
      github: 'https://github.com/jdrydn/testbank',

      ...(tenantId && {
        accounts: '/accounts',
        transactions: '/transactions',
      }),
    }, {
      baseUrl: ctx.apiBaseurl,
    }),
  };
}
