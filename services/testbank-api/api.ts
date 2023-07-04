import Koa from 'koa';
import KoaRouter from '@koa/router';
import ms from 'ms';
import serverless from 'serverless-http';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';

import { authenticate, requireAuth } from './middleware/auth';
import { AppContext, AppState, AppContextProps } from './context';

import * as routes from './routes';

export const app = new Koa<AppState, AppContext>();
export const router = new KoaRouter<AppState, AppContext>();
Object.defineProperties(app.context, AppContextProps);

router.get('/', ctx => {
  ctx.status = 200;
  ctx.body = { hello: 'world' };
});

router.use(requireAuth);

router.get('/accounts', routes.listAccounts);

app.use(authenticate);

app.use(router.routes()).use(router.allowedMethods());

export const handler = serverless(app, {
  request(req: any, event: APIGatewayProxyEventV2, context: Context & { startedAt: number }) {
    context.startedAt = Date.now();

    req.lambdaEvent = {
      ...event,
      multiValueHeaders: undefined,
      multiValueQueryStringParameters: undefined,
      pathParameters: undefined,
    };
    req.lambdaContext = context;

    const { any } = event.pathParameters || {};
    req.url = typeof any === 'string' ? `/${any || ''}` : req.url;
  },
  response(res: any, _event: APIGatewayProxyEventV2, context: Context & { startedAt: number }) {
    const { functionName, startedAt, awsRequestId } = context;
    res.headers['x-powered-by'] = functionName;
    res.headers['x-request-id'] = awsRequestId;
    res.headers['x-response-time'] = ms(Date.now() - startedAt);
  },
});
