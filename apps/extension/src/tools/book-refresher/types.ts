import type { RefresherResponse } from '@book-refresher/shared-types';

export type PopupMode = 'hidden' | 'loading' | 'normal' | 'sparse' | 'ambiguous' | 'lowConfidence' | 'error';

export type PopupState = {
  mode: PopupMode;
  response: RefresherResponse | null;
  message?: string;
};
