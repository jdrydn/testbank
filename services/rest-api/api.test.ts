import request from './test/request';
import { version } from './routes/welcome';

import { API_AUTH_HEADER } from './test/config';

describe('services/rest-api', () => {

  it('should successfully GET / when authenticated', async () => {
    await request.get('/')
      .set('Authorization', API_AUTH_HEADER)
      .expect(200)
      .expect({
        meta: {
          name: 'Testbank API',
          version,
        },
        links: {
          self: 'http://localhost:4000/',
          github: 'https://github.com/jdrydn/testbank',
          accounts: 'http://localhost:4000/accounts',
          transactions: 'http://localhost:4000/transactions',
        },
      });
  });

  it('should successfully GET / when not authenticated', async () => {
    await request.get('/')
      .expect(200)
      .expect({
        meta: {
          name: 'Testbank API',
          version,
        },
        links: {
          self: 'http://localhost:4000/',
          github: 'https://github.com/jdrydn/testbank',
        },
      });
  });

});
