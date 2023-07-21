import fs from 'fs';
import ms from 'ms';
import mysql from 'mysql2/promise';
import path from 'path';

const statements: [string, string][] = fs.readdirSync(__dirname)
  .filter(filename => path.extname(filename) === '.sql')
  .map(filename => [ filename, fs.readFileSync(path.resolve(__dirname, filename), 'utf8') ]);

export async function seedData(
  log: (action: string, message: string) => void = () => {}, // eslint-disable-line no-unused-vars
): Promise<void> {
  const conn = await mysql.createConnection({
    uri: process.env.MYSQL_URI ?? 'mysql://127.0.0.1:3306/test',
    connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT ?? '', 10) || 1,
    connectTimeout: ms(process.env.MYSQL_CONNECTION_TIMEOUT ?? '2s'),
    timezone: '+00:00', // Etc/UTC
    multipleStatements: true,
  });

  try {
    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    const [ results ] = await conn.query('SHOW TABLES');
    const tables = (results as any[]).reduce((list, table) => list.concat(Object.values(table)), [] as string[]);

    await conn.beginTransaction();
    try {
      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of tables) {
        await conn.query('TRUNCATE ??', [ table ]);
        log('🚫 Truncated', table);
      }
      for (const table of tables) {
        await conn.query('DROP TABLE ??', [ table ]);
        log('❌ Deleted', table);
      }
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
      await conn.commit();
    } catch (err) {
      await conn.rollback().catch(err2 => log('ERROR', err2));
      throw err;
    }

    await conn.beginTransaction();
    try {
      for (const [ filename, fileContents ] of statements) {
        await conn.query(fileContents);
        log('✅ Imported', filename);
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback().catch(err2 => log('ERROR', err2));
      throw err;
    }
  } finally {
    await conn.end().catch(err2 => log('ERROR', err2));
  }
}

if (require.main === module) {
  (async () => {
    /* eslint-disable no-console */
    try {
      await seedData(console.log);
      process.stdout.write('\n');
      console.log('Done!');
    } catch (err) {
      process.stdout.write('\n');
      console.error(err);
    }
  })();
}
