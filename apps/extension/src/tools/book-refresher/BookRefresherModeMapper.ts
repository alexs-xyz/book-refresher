import type { RefresherResponse } from '@book-refresher/shared-types';

import type { PopupMode } from './types';

export class BookRefresherModeMapper {
  toPopupMode(response: RefresherResponse): PopupMode {
    if (response.status === 'error') {
      return 'error';
    }

    return response.mode;
  }
}
