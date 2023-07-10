import _isPlainObject from 'lodash/isPlainObject';
import assert from 'http-assert-plus';
import ms from 'ms';
import { randomUUID } from 'crypto';
import type Koa from 'koa';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import type { IncomingMessage } from 'http';
import type { Options as ServerlessHttpOptions } from 'serverless-http';

import logger from '@/lib/logger';
import { attempt } from '@/lib/utils';

import { createResolver } from './resolvers';

export interface AppContext {
  apiBaseurl: string,
  ipAddress: string,
  log: typeof logger,
  requestId: string,
  resolve: ReturnType<typeof createResolver>,
}

export interface AppState {
  tenantId?: number,
  tokenId?: number,
}

export interface KoaRequest extends Koa.Request {
  req: IncomingMessage & {
    lambdaEvent?: APIGatewayProxyEventV2,
    lambdaContext?: Context,
  },
  body?: Record<string, any> | Record<string, any>[] | undefined,
}

export interface KoaContext<Body = unknown> extends Koa.ParameterizedContext<AppState, AppContext, Body> {
  request: KoaRequest,
  req: KoaRequest['req'],
}

export const AppContextProps: PropertyDescriptorMap & ThisType<KoaContext> = {
  apiBaseurl: {
    enumerable: true,
    get() {
      const { origin } = this.request;
      return origin;
    },
  },
  ipAddress: {
    enumerable: true,
    get() {
      const { sourceIp } = this.req.lambdaEvent?.requestContext.http ?? {};
      return sourceIp ?? this.request.ip;
    },
  },
  log: {
    enumerable: true,
    get() {
      return logger.child({ req_id: this.requestId });
    },
  },
  requestId: {
    enumerable: true,
    get() {
      const { awsRequestId } = this.req.lambdaContext ?? {};
      return awsRequestId ?? randomUUID();
    },
  },
  resolve: {
    enumerable: true,
    get() {
      return createResolver(this);
    },
  },
  userAgent: {
    enumerable: true,
    get() {
      const { userAgent } = this.req.lambdaEvent?.requestContext.http ?? {};
      return userAgent ?? this.request.get('User-Agent');
    },
  },
};

export const AppRequestProps: PropertyDescriptorMap & ThisType<KoaRequest> = {
  body: {
    enumerable: true,
    get() {
      const type = this.get('Content-Type');
      const { body, isBase64Encoded } = this.req.lambdaEvent ?? {};

      const rawBody = body && typeof body === 'string' // eslint-disable-line no-nested-ternary
        ? (isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body)
        : null;

      if (typeof type === 'string' && typeof rawBody === 'string' && type.startsWith('application/json')) {
        const parsed = attempt(() => JSON.parse(rawBody));
        assert(_isPlainObject(parsed) || Array.isArray(parsed), 400, 'Expected req body to be an array or object');
        return parsed;
      }

      return undefined;
    },
  },
};

export const serverlessHttpOpts: ServerlessHttpOptions = {
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
    res.headers['x-powered-by'] = context.functionName;
    res.headers['x-request-id'] = context.awsRequestId;
    res.headers['x-response-time'] = ms(Date.now() - context.startedAt);
  },
};
