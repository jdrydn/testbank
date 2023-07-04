import bunyan, { LogLevel } from 'bunyan';
import type Koa from 'koa';

const { AWS_LAMBDA_FUNCTION_NAME, LOG_LEVEL, LOG_NAME, NODE_ENV } = process.env;

function notEmptyObject(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]' && Object.keys(obj).length > 0;
}

const serializers = {
  request(req: Record<string, any>) {
    if (req && typeof req.method === 'string' && typeof req.url === 'string') {
      const { method, hostname, url, headers, ip: ipAddress, params, query, body } = req;
      return {
        method,
        hostname,
        url,
        headers: notEmptyObject(headers) ? headers : undefined,
        ipAddress,
        // cookies: notEmptyObject(cookies) ? cookies : undefined,
        params: notEmptyObject(params) ? params : undefined,
        query: notEmptyObject(query) ? query : undefined,
        body: notEmptyObject(body) ? body : undefined,
      };
    } else {
      return req;
    }
  },
  response(res: Record<string, any>) {
    if (res && typeof res.status === 'number') {
      const { status } = res;
      return {
        status,
        headers: notEmptyObject(res.headers) ? res.headers : undefined,
        body: Array.isArray(res.body?.errors) && res.body.errors.length ? res.body : undefined,
      };
    } else {
      return res;
    }
  },
  ctx(ctx: Koa.ParameterizedContext & { req: { event?: any, context?: any } }) {
    if (ctx && ctx.req && ctx.request && ctx.response) {
      return {
        event: notEmptyObject(ctx.req.event) ? ctx.req.event : undefined,
        context: notEmptyObject(ctx.req.context) ? ctx.req.context : undefined,
        request: serializers.request(ctx.request),
        response: serializers.response(ctx.response),
        state: ctx.state,
      };
    } else {
      return ctx;
    }
  },
  err(err: any) {
    if (err instanceof Error) {
      const output = bunyan.stdSerializers.err(err);

      for (const key in err) {
        if (err.hasOwnProperty(key) && key !== 'message' && key !== 'stack') {
          output[key] = (err as Record<string, any>)[key];
        }
      }

      return output;
    } else {
      return err;
    }
  },
};

export default bunyan.createLogger({
  name: LOG_NAME ?? AWS_LAMBDA_FUNCTION_NAME ?? 'testbank',
  level: (LOG_LEVEL ?? (NODE_ENV === 'production' ? 'info' : 'debug')) as LogLevel,
  serializers,
});
