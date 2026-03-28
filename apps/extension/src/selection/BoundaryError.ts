import { DEFAULT_INVALID_SELECTION_REASON, type SelectionState } from './types';

export type BoundaryErrorReason =
  | 'missingSelectionRange'
  | 'outsideTextLayer'
  | 'multiPageSelection'
  | 'pageResolutionFailed'
  | 'prefixExtractionFailed';

const DEFAULT_BOUNDARY_MESSAGES: Record<BoundaryErrorReason, string> = {
  missingSelectionRange: 'Please reselect text inside the reader first.',
  outsideTextLayer: 'Please select text inside the PDF text layer.',
  multiPageSelection: 'Please select text on a single page.',
  pageResolutionFailed: 'The reader could not locate the selected page. Please reselect text on the page.',
  prefixExtractionFailed:
    'The reader could not build a spoiler-safe prefix for this selection. Please reselect a smaller text region.'
};

export class BoundaryError extends Error {
  override readonly name = 'BoundaryError';

  constructor(
    readonly reason: BoundaryErrorReason,
    message: string = DEFAULT_BOUNDARY_MESSAGES[reason]
  ) {
    super(message);
  }
}

export function toBoundaryError(selection: SelectionState): BoundaryError {
  if (!selection.selectionRange || !selection.selectedText.trim()) {
    return new BoundaryError(
      'missingSelectionRange',
      selection.invalidReason ?? DEFAULT_INVALID_SELECTION_REASON
    );
  }

  if (selection.invalidReason === 'Please select text on a single page.') {
    return new BoundaryError('multiPageSelection', selection.invalidReason);
  }

  if (selection.invalidReason === 'Please select text inside the PDF text layer.') {
    return new BoundaryError('outsideTextLayer', selection.invalidReason);
  }

  return new BoundaryError(
    'missingSelectionRange',
    selection.invalidReason ?? DEFAULT_INVALID_SELECTION_REASON
  );
}
