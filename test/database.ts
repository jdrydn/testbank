import assert from 'assert';
import { mysqlQuery, sql } from '@/lib/mysql';

/**
 * Get the next insert ID for a table.
 */
export async function getNextInsertId(table: string): Promise<number> {
  const selectQuery = sql.select()
    .field('auto_increment')
    .from('INFORMATION_SCHEMA.TABLES')
    .where('table_name = ?', table);
  const nextInsertId = (await mysqlQuery(selectQuery)).single<number>();
  assert(nextInsertId, 'Expected table to have an auto_increment value');
  return nextInsertId;
}
