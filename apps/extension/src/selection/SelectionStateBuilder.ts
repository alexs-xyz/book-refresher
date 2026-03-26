import {
  createEmptySelectionState,
  type SelectionAnchorRect,
  type SelectionState
} from './types';

const normalizeSelectedText = (selectedText: string): string => {
  return selectedText.replace(/\s+/g, ' ').trim();
};

const cloneSelectionRange = (selection: Selection | null): Range | null => {
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  return selection.getRangeAt(0).cloneRange();
};

const toAnchorRect = (selectionRange: Range | null): SelectionAnchorRect | null => {
  if (!selectionRange || typeof selectionRange.getBoundingClientRect !== 'function') {
    return null;
  }

  const rect = selectionRange.getBoundingClientRect();
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
};

export class SelectionStateBuilder {
  build(selection: Selection | null): SelectionState {
    const selectionRange = cloneSelectionRange(selection);

    return {
      ...createEmptySelectionState(),
      selectedText: normalizeSelectedText(selection?.toString() ?? ''),
      selectionRange,
      anchorRect: toAnchorRect(selectionRange)
    };
  }
}
