import assert from 'assert';

Object.assign(process.env, {
  NODE_ENV: 'testing',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'fatal',
});

before(() => {
  assert(process.env.MYSQL_URI, 'Expected MYSQL_URI env to be set');
  console.log('Seeding database: %s', process.env.MYSQL_URI);
  return new Promise<void>(resolve => setTimeout(() => resolve(), 1900));
});

before(async () => {
  assert(process.env.MYSQL_URI, 'Expected MYSQL_URI env to be set');
  const { seedData } = await import('./database/import');
  await seedData();
  process.stdout.write('\n\n');
});
