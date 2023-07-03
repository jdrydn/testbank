Object.assign(process.env, {
  MYSQL_URI: process.env.MYSQL_URI ?? 'mysql://developer:f69bbd182b5828921b295d5e7aeb1378@127.0.0.1:3306/testbank-dev',
});

before(async () => {
  const { seedData } = await import('./database/import');
  await seedData();
  console.log('Database seeded: %s\n\n', process.env.MYSQL_URI!);
});
