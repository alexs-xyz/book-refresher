import {
  refresherRequestSchema,
  refresherResponseSchema,
  type RefresherRequest,
  type RefresherResponse
} from '@book-refresher/shared-types';

import { ApiClient } from './ApiClient';

export class RefresherApi {
  constructor(private readonly client: ApiClient) {}

  async requestRefresher(input: RefresherRequest): Promise<RefresherResponse> {
    const payload = refresherRequestSchema.parse(input);
    return this.client.post('/api/refresher', payload, refresherResponseSchema);
  }
}
