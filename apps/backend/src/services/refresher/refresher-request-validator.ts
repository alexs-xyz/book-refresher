import type { RefresherRequest } from '@book-refresher/shared-types';

import type { ValidatedRefresherRequest } from './refresher-pipeline.types';
import { RefresherRequestValidationError } from './refresher-request-validation-error';

const normalizeSelectedText = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

export class RefresherRequestValidator {
  validate(request: RefresherRequest): ValidatedRefresherRequest {
    const normalizedSelectedText = normalizeSelectedText(request.selectedText);
    const trimmedLocalContext = request.localContext.trim();
    const trimmedPrefixText = request.prefixText.trim();

    if (!normalizedSelectedText) {
      throw new RefresherRequestValidationError(
        'The refresher request must include visible selected text.'
      );
    }

    if (!trimmedLocalContext) {
      throw new RefresherRequestValidationError(
        'The refresher request must include visible local context.'
      );
    }

    if (!trimmedPrefixText) {
      throw new RefresherRequestValidationError(
        'The refresher request must include visible prefix text.'
      );
    }

    return {
      ...request,
      normalizedSelectedText,
      trimmedLocalContext,
      trimmedPrefixText,
      prefixLength: trimmedPrefixText.length
    };
  }
}
