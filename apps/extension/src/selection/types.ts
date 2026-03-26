export type SelectionAnchorRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

export type SelectionState = {
  selectedText: string;
  selectedPage: number | null;
  selectionRange: Range | null;
  anchorRect: SelectionAnchorRect | null;
  localContext: string;
  isValid: boolean;
  invalidReason?: string;
};

export const DEFAULT_INVALID_SELECTION_REASON = 'Please select text inside the reader first.';

export const createEmptySelectionState = (
  invalidReason: string = DEFAULT_INVALID_SELECTION_REASON
): SelectionState => ({
  selectedText: '',
  selectedPage: null,
  selectionRange: null,
  anchorRect: null,
  localContext: '',
  isValid: false,
  invalidReason
});
