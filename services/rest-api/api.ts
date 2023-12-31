import Koa from 'koa';
import KoaRouter from '@koa/router';
import serverless from 'serverless-http';
import { bodyParser } from '@koa/bodyparser';

import { authenticate, requireAuth } from './middleware/authenticate';
import { wrapErrorMiddleware as errors } from './middleware/errors';
import { AppContextProps, AppContext, AppState, serverlessHttpOpts } from './context';

import * as routes from './routes';

export const app = new Koa<AppState, AppContext>();
export const router = new KoaRouter<AppState, AppContext>();
Object.defineProperties(app.context, AppContextProps);

app.use(errors);
app.use(authenticate);
app.use(bodyParser({ encoding: 'utf8', enableTypes: [ 'json' ], jsonStrict: true }))

router.get('/', routes.welcome);
router.get('/currencies', routes.listCurrencies);

router.use(requireAuth);

router.get('/accounts', routes.listAccounts);
router.post('/accounts', routes.createAccount);
router.get('/accounts/:accountId', routes.getAccount);
router.patch('/accounts/:accountId', routes.updateAccount);
router.delete('/accounts/:accountId', routes.deleteAccount);

app.use(router.routes()).use(router.allowedMethods());

export const handler = serverless(app, serverlessHttpOpts);
