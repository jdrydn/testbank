import Koa from 'koa';
import KoaRouter from '@koa/router';
import serverless from 'serverless-http';

export const app = new Koa();
export const router = new KoaRouter();

router.get('/', ctx => {
  ctx.status = 200;
  ctx.body = { hello: 'world' };
});

app.use(router.routes()).use(router.allowedMethods());

export const handler = serverless(app);
