import assert from 'http-assert-plus';
import Hashids from 'hashids';
import * as yup from 'yup';

const hashid = new Hashids('2e5ed8');

export function encodeAccountId(tenantId: number, accountId: number): string {
  return hashid.encode([tenantId, accountId]);
}
export function decodeAccountId(encoded: string): [number, number] {
  const [tenantId, accountId] = hashid.decode(encoded);
  assert(typeof tenantId === 'number', 400, 'Missing tenantId from encoded accountId');
  assert(typeof accountId === 'number', 400, 'Missing accountId from encoded accountId');
  return [tenantId, accountId];
}

export function yupAccountId() {
  return yup.mixed<yup.StringSchema | yup.NumberSchema>().oneOf([
    yup.string(),
    yup.number(),
  ]);
}
