import type { SelectionState } from './types';

export class SelectionValidator {
  validate(state: SelectionState): SelectionState {
    if (!state.selectedText.trim()) {
      return {
        ...state,
        isValid: false,
        invalidReason: 'Please select text inside the reader first.'
      };
    }

    return {
      ...state,
      isValid: true,
      invalidReason: undefined
    };
  }
}
