import supertest from 'supertest';

import { app } from '../api';

Object.defineProperties(app.request, {
  origin: {
    enumerable: true,
    get: () => 'http://localhost:4000',
  },
});

const request = supertest(app.callback());
export default request;
