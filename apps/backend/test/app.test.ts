import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app';

describe('backend app', () => {
  it('returns health information', async () => {
    const { app } = await buildApp({ NODE_ENV: 'test' });

    const response = await app.inject({
      method: 'GET',
      url: '/api/health'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe('ok');

    await app.close();
  });
});
