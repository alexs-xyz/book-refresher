import type { SelectionState } from './types';

export class SelectionStateBuilder {
  scaffold(): SelectionState {
    return {
      selectedText: 'Darcy',
      selectedPage: 12,
      localContext: 'Elizabeth looked at Darcy and turned away.',
      isValid: true
    };
  }
}
