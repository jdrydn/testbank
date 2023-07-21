/* eslint-disable max-classes-per-file */
import assert from 'assert';
import ms from 'ms';
import mysql from 'mysql2/promise';
import squel from 'squel';
import { format as formatDate } from 'date-fns';

import logger from './logger';

const client = mysql.createPool({
  uri: process.env.MYSQL_URI ?? 'mysql://127.0.0.1:3306/test',
  connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT ?? '', 10) || 1,
  connectTimeout: ms(process.env.MYSQL_CONNECTION_TIMEOUT ?? '2s'),
  timezone: '+00:00', // Etc/UTC
  typeCast(field, next) {
    /* eslint-disable no-confusing-arrow */
    if ((field.type === 'TINY' && field.length === 1) || field.type === 'BOOLEAN') {
      // If this is a MySQL pseudo-boolean, parse it thusly
      return (value => value === null ? null : value === '1')(field.string());
    } else {
      return next();
    }
  },
});

export const sql = (() => {
  const flavour = squel.useFlavour('mysql');

  interface MysqlSquel extends squel.MysqlSquel {
    selectFoundRows: () => squel.Select,
  }

  Object.defineProperties(flavour, {
    /**
     * Useful modification to the standard SELECT squel constructor to add SQL_CALC_FOUND_ROWS to the SELECT block
     */
    selectFoundRows: {
      enumerable: true,
      value: function selectFoundRows(options?: Partial<squel.CompleteQueryBuilderOptions> | undefined) {
        return sql.select(options ?? null, [
          new squel.cls.StringBlock(options ?? null, 'SELECT SQL_CALC_FOUND_ROWS'),
          new squel.cls.FunctionBlock(options),
          new squel.cls.DistinctBlock(options),
          new squel.cls.GetFieldBlock(options),
          new squel.cls.FromTableBlock(options),
          new squel.cls.JoinBlock(options),
          new squel.cls.WhereBlock(options),
          new squel.cls.GroupByBlock(options),
          new squel.cls.HavingBlock(options),
          new squel.cls.OrderByBlock(options),
          new squel.cls.LimitBlock(options),
          new squel.cls.OffsetBlock(options),
          new squel.cls.UnionBlock(options),
        ]);
      },
    },
  });

  /**
   * Common query transformations, for Dates & undefined types
   */
  squel.registerValueHandler(Date, value => formatDate(value, 'YYYY-MM-DDTHH:mm:ss'));
  squel.registerValueHandler('undefined', () => null as any);

  return flavour as MysqlSquel;
})();

export type MysqlSession = mysql.PoolConnection;

/**
 * Open a dedicated connection to the database.
 * Reduces DB interaction time when we have multiple database queries to perform.
 */
export async function getMysqlConnection<T = any>(
  conn: MysqlSession | undefined,
  fn: (session: MysqlSession) => Promise<T>, // eslint-disable-line no-unused-vars
): Promise<T> {
  if (conn) {
    return fn(conn);
  } else {
    // logger.debug('getMysqlConnection started');
    const connection = await client.getConnection();

    try {
      const result = await fn(connection);
      return result;
    } finally {
      connection.release();
      // logger.debug('getMysqlConnection finished');
    }
  }
}

/* eslint-disable no-redeclare, no-unused-vars, no-use-before-define */
export async function mysqlQuery<T = Record<string, any>>(
  query: squel.Select, conn?: MysqlSession,
): Promise<MysqlReadResult<T>>;
export async function mysqlQuery<T = number>(
  query: squel.Insert, conn?: MysqlSession
): Promise<MysqlWriteResult<T>>;
export async function mysqlQuery(
  query: squel.Update, conn?: MysqlSession
): Promise<MysqlWriteResult>;
export async function mysqlQuery(
  query: squel.Delete, conn?: MysqlSession
): Promise<MysqlWriteResult>;
export async function mysqlQuery<R = unknown, W = number>(
  query: squel.QueryBuilder | string | [string, any[]],
): Promise<MysqlReadResult<R> | MysqlWriteResult<W>>;
/**
 * Execute a query against the database.
 */
export async function mysqlQuery<R = Record<string, any>, W = never>(
  query: squel.QueryBuilder | string | [string, any[]], conn?: MysqlSession | undefined,
): Promise<MysqlReadResult<R> | MysqlWriteResult<W>> {
  let text: string = '';
  let values: any[] = [];

  if (Array.isArray(query) && query.length === 2) {
    ([ text, values ] = query);
  } else if (typeof query === 'string') {
    text = query;
  } else {
    assert(query && typeof query.toParam === 'function',
      new TypeError(`Expected query to be a Statement | string | [string, any[]] but found: ${typeof query}`));
    ({ text, values } = query.toParam());
  }

  try {
    if (text.trim().toUpperCase().startsWith('SELECT SQL_CALC_FOUND_ROWS')) {
      return getMysqlConnection(conn, async c => {
        const [ rows, fields ] = await (conn ?? client).query(text, values);
        const foundQuery = 'SELECT FOUND_ROWS() AS foundRows';
        const [ [ { foundRows } ] ] = (await (conn ?? client).query(foundQuery)) as unknown as [[{foundRows: number}]];
        return new MysqlReadResult(rows as R[], fields, foundRows);
      });
    } else if (text.trim().toUpperCase().startsWith('SELECT ')) {
      const [ rows, fields ] = await (conn ?? client).query(text, values);
      return new MysqlReadResult(rows as R[], fields);
    } else {
      const [ results ] = (await (conn ?? client).query(text, values)) as unknown as [ mysql.OkPacket ];
      return new MysqlWriteResult(results.affectedRows, results.changedRows, results.insertId as W);
    }
  } catch (err: any) {
    err.name = `Mysql${err.name}`;
    err.sql = { text, values };
    throw err;
  }
}
/* eslint-enable no-redeclare, no-unused-vars, no-use-before-define */

/**
 * Start a connection with a DB transaction, which commits on function end.
 * Since there's no way to work out if a connection
 */
export function getMysqlTransaction<T>(
  fn: (conn: MysqlSession) => T | Promise<T>, // eslint-disable-line no-unused-vars
): Promise<T> {
  return getMysqlConnection(undefined, async conn => {
    try {
      // logger.debug('getMysqlTransaction started');
      await conn.beginTransaction();
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (err) {
      try {
        await conn.rollback();
      } catch (rerr) {
        /* Log rollback_err somewhere? */
        logger.fatal({ err, rollbackErr: rerr }, 'Error rolling back MySQL transaction');
      }
      throw err;
    } finally {
      // logger.debug('getMysqlTransaction finished');
    }
  });
}

class MysqlReadResult<T = Record<string, any>> {
  public rows: T[];
  public fields: string[];
  public foundRows: number | undefined;

  constructor(rows: T[], fields: mysql.FieldPacket[], foundRows?: number) {
    this.rows = rows;
    this.fields = fields.map(field => field.name);
    this.foundRows = foundRows;
  }

  find(fn: (value: T, index: number, rows: T[]) => boolean): T | undefined { // eslint-disable-line no-unused-vars
    return (Array.isArray(this.rows) ? this.rows : []).find(fn);
  }
  filter(fn: (value: T, index: number, rows: T[]) => boolean) { // eslint-disable-line no-unused-vars
    return (Array.isArray(this.rows) ? this.rows : []).filter(fn);
  }
  forEach(fn: (value: T, index: number, rows: T[]) => void) { // eslint-disable-line no-unused-vars
    return (Array.isArray(this.rows) ? this.rows : []).forEach(fn);
  }
  map<U = any>(fn: (value: T, index: number, rows: T[]) => U) { // eslint-disable-line no-unused-vars
    return (Array.isArray(this.rows) ? this.rows : []).map(fn);
  }

  // eslint-disable-next-line no-unused-vars
  reduce(fn: (acc: T, value: T, index: number, rows: T[]) => T): T;
  // eslint-disable-next-line no-redeclare, no-unused-vars, no-dupe-class-members
  reduce<U>(fn: (acc: U, value: T, index: number, rows: T[]) => U, start: U): U;
  // eslint-disable-next-line no-redeclare, no-unused-vars, no-dupe-class-members
  reduce<U>(fn: (acc: U, value: T, index: number, rows: T[]) => U, start?: any): U {
    return (Array.isArray(this.rows) ? this.rows : []).reduce(fn, start);
  }

  first() {
    return (Array.isArray(this.rows) ? this.rows : []).slice().shift();
  }

  column<U = string>(): U[] {
    if (this.fields.length) {
      const [ field ] = this.fields;
      return this.rows.reduce((values, row) => {
        if (Object.prototype.hasOwnProperty.call(row, field)) {
          values.push(row[field as keyof typeof row] as U);
        }
        return values;
      }, [] as U[]);
    } else {
      return [];
    }
  }

  single<U = string>() {
    if (this.rows.length && this.fields.length) {
      const [ row ] = this.rows;
      const [ field ] = this.fields;
      return Object.prototype.hasOwnProperty.call(row, field) ? row[field as keyof typeof row] as U : undefined;
    } else {
      return undefined;
    }
  }
}

class MysqlWriteResult<T = never> {
  public affectedRows: number;
  public changedRows: number;
  public insertId: T;

  constructor(affectedRows: number, changedRows: number, insertId: T) {
    this.affectedRows = affectedRows;
    this.changedRows = changedRows;
    this.insertId = insertId;
  }
}
