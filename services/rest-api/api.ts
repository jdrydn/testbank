import Koa from 'koa';
import KoaRouter from '@koa/router';
import serverless from 'serverless-http';

import { authenticate, requireAuth } from './middleware/authenticate';
import { wrapErrorMiddleware } from './middleware/errors';
import { AppContextProps, AppRequestProps, AppContext, AppState, serverlessHttpOpts } from './context';

import * as routes from './routes';

export const app = new Koa<AppState, AppContext>();
export const router = new KoaRouter<AppState, AppContext>();
Object.defineProperties(app.context, AppContextProps);
Object.defineProperties(app.request, AppRequestProps);

app.use(wrapErrorMiddleware);
app.use(authenticate);

router.get('/', routes.welcome);
router.get('/currencies', routes.listCurrencies);

router.get('/accounts', requireAuth, routes.listAccounts);

app.use(router.routes()).use(router.allowedMethods());

export const handler = serverless(app, serverlessHttpOpts);
