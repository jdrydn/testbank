import _isPlainObject from 'lodash/isPlainObject';
import assert from 'http-assert-plus';
import { randomUUID } from 'crypto';
import type Koa from 'koa';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import type { IncomingMessage } from 'http';

import logger from '@/lib/logger';
import { attempt } from '@/lib/utils';

export interface AppContext {
  body: Record<string, any> | any[],
  ipAddress: string,
  log: typeof logger,
  requestId: string,
}

export interface AppState {
  tenantId?: number,
  tokenId?: number,
}

export interface KoaContext<Body = unknown> extends Koa.ParameterizedContext<AppState, AppContext, Body> {
  req: IncomingMessage & {
    lambdaEvent?: APIGatewayProxyEventV2,
    lambdaContext?: Context,
  },
}

export const AppContextProps: PropertyDescriptorMap & ThisType<KoaContext> = {
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
  body: {
    enumerable: true,
    get() {
      const type = this.request.get('Content-Type');
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
  requestId: {
    enumerable: true,
    get() {
      const { awsRequestId } = this.req.lambdaContext ?? {};
      return awsRequestId ?? randomUUID();
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
