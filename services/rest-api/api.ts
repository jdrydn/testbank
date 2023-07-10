import Koa from 'koa';
import KoaRouter from '@koa/router';
import serverless from 'serverless-http';
import type { JsonApiResource } from 'jsonapi-resolvers';

import { authenticate, requireAuth } from './middleware/authenticate';
import { configure } from './middleware/configure';
import { AppContextProps, AppRequestProps, serverlessHttpOpts } from './context';
import type { KoaContext, AppContext, AppState } from './context';

import * as routes from './routes';

export const app = new Koa<AppState, AppContext>();
export const router = new KoaRouter<AppState, AppContext>();
Object.defineProperties(app.context, AppContextProps);
Object.defineProperties(app.request, AppRequestProps);

app.use(configure);
app.use(authenticate);

router.get('/', (ctx: KoaContext<Pick<JsonApiResource, 'meta' | 'links'>>) => {
  ctx.status = 200;
  ctx.body = {
    meta: {
      name: 'Testbank API',
    },
    links: {
      self: ctx.apiBaseurl,
      github: 'https://github.com/testbankhq',
    },
  };
});

router.use(requireAuth);

router.get('/accounts', routes.listAccounts);

app.use(router.routes()).use(router.allowedMethods());

export const handler = serverless(app, serverlessHttpOpts);
