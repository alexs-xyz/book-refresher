import type { RefresherResponse } from '@book-refresher/shared-types';

import { RefresherApi } from '../../api/RefresherApi';
import type { SelectionState } from '../../selection/types';
import type { ReaderDocumentState } from '../../reader-app/types';
import {
  BookRefresherRequestBuilder,
  type BookRefresherRequestBuildContext
} from './BookRefresherRequestBuilder';

export class BookRefresherController {
  private readonly requestBuilder = new BookRefresherRequestBuilder();

  constructor(private readonly refresherApi: RefresherApi) {}

  async request(
    selection: SelectionState,
    document: ReaderDocumentState,
    context: BookRefresherRequestBuildContext
  ): Promise<RefresherResponse> {
    const request = await this.requestBuilder.build(selection, document, context);
    return this.refresherApi.requestRefresher(request);
  }
}
