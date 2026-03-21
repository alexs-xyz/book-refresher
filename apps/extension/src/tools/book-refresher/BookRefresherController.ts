import type { RefresherResponse } from '@book-refresher/shared-types';

import { RefresherApi } from '../../api/RefresherApi';
import type { SelectionState } from '../../selection/types';
import type { ReaderDocumentState } from '../../reader-app/types';
import { BookRefresherRequestBuilder } from './BookRefresherRequestBuilder';

export class BookRefresherController {
  private readonly requestBuilder = new BookRefresherRequestBuilder();

  constructor(private readonly refresherApi: RefresherApi) {}

  async request(selection: SelectionState, document: ReaderDocumentState): Promise<RefresherResponse> {
    const request = this.requestBuilder.build(selection, document);
    return this.refresherApi.requestRefresher(request);
  }
}
