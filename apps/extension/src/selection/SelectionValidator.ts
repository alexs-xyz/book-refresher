import { PageBoundaryResolver } from './PageBoundaryResolver';
import { DEFAULT_INVALID_SELECTION_REASON, type SelectionState } from './types';

const OUTSIDE_TEXT_LAYER_REASON = 'Please select text inside the PDF text layer.';
const MULTI_PAGE_SELECTION_REASON = 'Please select text on a single page.';

const createInvalidSelectionState = (state: SelectionState, invalidReason: string): SelectionState => ({
  ...state,
  selectedPage: null,
  isValid: false,
  invalidReason
});

export class SelectionValidator {
  private readonly pageBoundaryResolver: PageBoundaryResolver;

  constructor(private readonly root: HTMLElement) {
    this.pageBoundaryResolver = new PageBoundaryResolver(root);
  }

  validate(state: SelectionState): SelectionState {
    const selectionRange = state.selectionRange;
    if (!selectionRange || !state.selectedText) {
      return createInvalidSelectionState(state, DEFAULT_INVALID_SELECTION_REASON);
    }

    if (!this.isInsideRoot(selectionRange.commonAncestorContainer)) {
      return createInvalidSelectionState(state, DEFAULT_INVALID_SELECTION_REASON);
    }

    const boundaryResolution = this.pageBoundaryResolver.resolve(selectionRange);
    switch (boundaryResolution.kind) {
      case 'outsideTextLayer':
        return createInvalidSelectionState(state, OUTSIDE_TEXT_LAYER_REASON);
      case 'multiPage':
        return createInvalidSelectionState(state, MULTI_PAGE_SELECTION_REASON);
      case 'singlePage':
        return {
          ...state,
          selectedPage: boundaryResolution.selectedPage,
          isValid: true,
          invalidReason: undefined
        };
    }
  }

  private isInsideRoot(node: Node): boolean {
    const element = node instanceof Element ? node : node.parentElement;
    return Boolean(element && this.root.contains(element));
  }
}
