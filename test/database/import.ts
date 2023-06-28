import fs from 'fs/promises';
import mysql from 'mysql2/promise';
import path from 'path';

async function deleteTables(conn: mysql.Connection): Promise<void> {
  const [results] = await conn.query('SHOW TABLES');
  const tables = (results as any[]).reduce((list, table) => list.concat(Object.values(table)), [] as string[]);

  await conn.beginTransaction();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tables) {
      await conn.query('TRUNCATE ??', [table]);
    }
    for (const table of tables) {
      await conn.query('DROP TABLE ??', [table]);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    await conn.commit();
  } catch (err) {
    await conn.rollback().catch(err2 => console.error(err2));
    throw err;
  }
}

(async () => {
  const opts = {
    uri: 'mysql://developer:f69bbd182b5828921b295d5e7aeb1378@127.0.0.1:3306/testbank-dev',
    multipleStatements: true,
  };

  const conn = await mysql.createConnection(opts);
  await deleteTables(conn);

  try {
    const files = (await fs.readdir(__dirname)).filter(filename => path.extname(filename) === '.sql');

    for (const filename of files) {
      const fileContents = await fs.readFile(path.resolve(__dirname, filename), 'utf8');
      await conn.query(fileContents);
      console.log('Imported %s ✅', filename);
    }

    process.stdout.write('\n');
    console.log('Done!');
  } catch (err) {
    process.stdout.write('\n');
    console.error(err);
  } finally {
    await conn.end().catch(err => console.error(err));
  }
})();
