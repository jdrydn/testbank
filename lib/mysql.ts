import assert from 'assert';
import ms from 'ms';
import mysql from 'mysql2/promise';
import sqlbricks from 'sql-bricks';

const client = mysql.createPool({
  uri: process.env.MYSQL_URL ?? 'mysql://127.0.0.1:3306',
  connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT ?? '', 10) || 1,
  connectTimeout: ms(process.env.MYSQL_CONNECTION_TIMEOUT ?? '2s'),
  timezone: 'UTC',
  typeCast(field, next) {
    if ((field.type === 'TINY' && field.length === 1) || field.type === 'BOOLEAN') {
      // If this is a MySQL pseudo-boolean, parse it thusly
      return (value => value === null ? null : value === '1')(field.string());
    } else {
      return next();
    }
  },
});

export const sql: typeof sqlbricks & { _autoQuoteChar: string } = sqlbricks._extension();
// @LINK https://github.com/tamarzil/mysql-bricks/blob/d981523863c428145fc5e4976e53fb0aca0a3a39/index.js#L9
// unfortunately, for now, this can only be done by overriding sql-bricks module itself
// see issue https://github.com/CSNW/sql-bricks/issues/104
sql._autoQuoteChar = '`';

export type MysqlSession = mysql.PoolConnection;

export async function getMysqlConnection<T = any>(
  conn: MysqlSession | undefined,
  fn: (session: MysqlSession) => Promise<T>,
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

export async function mysqlQuery<T = Record<string, any>>(
  query: sqlbricks.SelectStatement, conn?: MysqlSession, foundRows?: true,
): Promise<MysqlReadResult<T>>;
export async function mysqlQuery<T = number>(
  query: sqlbricks.InsertStatement, conn?: MysqlSession
): Promise<MysqlWriteResult<T>>;
export async function mysqlQuery(
  query: sqlbricks.UpdateStatement, conn?: MysqlSession
): Promise<MysqlWriteResult>;
export async function mysqlQuery(
  query: sqlbricks.DeleteStatement, conn?: MysqlSession
): Promise<MysqlWriteResult>;
export async function mysqlQuery<R = unknown, W = number>(
  query: sqlbricks.Statement | string | [string, any[]],
): Promise<MysqlReadResult<R> | MysqlWriteResult<W>>;
export async function mysqlQuery<R = Record<string, any>, W = never>(
  query: sqlbricks.Statement | string | [string, any[]],
  conn?: MysqlSession | undefined,
  foundRows?: true,
): Promise<MysqlReadResult<R> | MysqlWriteResult<W>> {
  let text: string = '';
  let values: any[] = [];

  if (Array.isArray(query) && query.length === 2) {
    ([text, values] = query);
  } else if (typeof query === 'string') {
    text = query;
  } else {
    assert(query && typeof query.toParams === 'function',
      new TypeError(`Expected query to be a Statement | string | [string, any[]] but found: ${typeof query}`));
    ({ text, values } = query.toParams());
  }

  try {
    if (text.trim().toUpperCase().startsWith('SELECT') && foundRows === true) {
      text = text.replace(/^SELECT /i, 'SELECT SQL_CALC_FOUND_ROWS ');
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

export function getMysqlTransaction<T>(
  fn: (conn: MysqlSession) => T | Promise<T>,
): Promise<T> {
  return getMysqlConnection(undefined, async conn => {
    try {
      // logger.debug('getMysqlTransaction started');
      await conn.beginTransaction();
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (err) {
      try { await conn.rollback(); }
      catch (rollback_err) { /* Log rollback_err somewhere? */ }
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

  find(fn: (value: T, index: number, rows: T[]) => boolean): T | undefined {
    return (Array.isArray(this.rows) ? this.rows : []).find(fn);
  }
  filter(fn: (value: T, index: number, rows: T[]) => boolean) {
    return (Array.isArray(this.rows) ? this.rows : []).filter(fn);
  }
  forEach(fn: (value: T, index: number, rows: T[]) => void) {
    return (Array.isArray(this.rows) ? this.rows : []).forEach(fn);
  }
  map<U = any>(fn: (value: T, index: number, rows: T[]) => U) {
    return (Array.isArray(this.rows) ? this.rows : []).map(fn);
  }

  reduce(fn: (acc: T, value: T, index: number, rows: T[]) => T): T;
  reduce<U>(fn: (acc: U, value: T, index: number, rows: T[]) => U, start: U): U;
  reduce<U>(fn: (acc: U, value: T, index: number, rows: T[]) => U, start?: any): U {
    return (Array.isArray(this.rows) ? this.rows : []).reduce(fn, start);
  }

  first() {
    return (Array.isArray(this.rows) ? this.rows : []).slice().shift();
  }

  column<U = string>(): U[] | null {
    if (this.fields.length) {
      const [field] = this.fields;
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
      const [row] = this.rows;
      const [field] = this.fields;
      return Object.prototype.hasOwnProperty.call(row, field) ? row[field as keyof typeof row] as U : null;
    } else {
      return null;
    }
  }

}

class MysqlWriteResult<T = never> {

  public affectedRows: number;
  public changedRows: number;
  public insertId: T | undefined;

  constructor(affectedRows: number, changedRows: number, insertId?: T) {
    this.affectedRows = affectedRows;
    this.changedRows = changedRows;
    this.insertId = insertId;
  }

}
