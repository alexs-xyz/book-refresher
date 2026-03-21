import { healthResponseSchema, type HealthResponse } from '@book-refresher/shared-types';

import { ApiClient } from './ApiClient';

export class HealthApi {
  constructor(private readonly client: ApiClient) {}

  async getHealth(): Promise<HealthResponse> {
    return this.client.get('/api/health', healthResponseSchema);
  }
}
