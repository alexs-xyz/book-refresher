import { normalizeExtractedText } from '../shared/normalizeExtractedText';

const DEFAULT_CONTEXT_WINDOW_CHARACTERS = 280;

const normalizeSelectedText = (selectedText: string): string => {
  return selectedText.replace(/\s+/g, ' ').trim();
};

export class LocalContextExtractor {
  constructor(private readonly maxCharacters = DEFAULT_CONTEXT_WINDOW_CHARACTERS) {}

  extract(prefixText: string, selectedText: string): string {
    const normalizedPrefix = normalizeExtractedText(prefixText);
    const normalizedSelection = normalizeSelectedText(selectedText);

    if (!normalizedPrefix || !normalizedSelection) {
      return '';
    }

    const selectionIndex = normalizedPrefix.lastIndexOf(normalizedSelection);
    const selectionEndIndex =
      selectionIndex === -1 ? normalizedPrefix.length : selectionIndex + normalizedSelection.length;
    const contextStartIndex = Math.max(0, selectionEndIndex - this.maxCharacters);

    return normalizedPrefix.slice(contextStartIndex, selectionEndIndex).trim();
  }
}
