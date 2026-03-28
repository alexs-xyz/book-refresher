import type { PDFDocumentProxy } from 'pdfjs-dist';

import { normalizeExtractedText } from '../shared/normalizeExtractedText';

type ExtractableTextItem = {
  str: string;
  hasEOL?: boolean;
  transform?: number[];
  width?: number;
};

const SAME_LINE_Y_TOLERANCE = 1;
const MIN_SPACE_GAP = 1.5;

const isExtractableTextItem = (value: unknown): value is ExtractableTextItem => {
  return Boolean(value && typeof value === 'object' && 'str' in value && typeof value.str === 'string');
};

const shouldInsertLineBreak = (
  previousItem: ExtractableTextItem | null,
  currentItem: ExtractableTextItem
): boolean => {
  if (!previousItem?.transform || !currentItem.transform) {
    return false;
  }

  const previousY = previousItem.transform[5];
  const currentY = currentItem.transform[5];
  return Math.abs(currentY - previousY) > SAME_LINE_Y_TOLERANCE;
};

const shouldInsertSpace = (
  previousItem: ExtractableTextItem | null,
  currentItem: ExtractableTextItem
): boolean => {
  if (!previousItem) {
    return false;
  }

  if (/\s$/.test(previousItem.str) || /^\s/.test(currentItem.str)) {
    return false;
  }

  if (/^[,.;:!?)}\]"'`]/.test(currentItem.str)) {
    return false;
  }

  if (previousItem.transform && currentItem.transform && typeof previousItem.width === 'number') {
    const previousRight = previousItem.transform[4] + previousItem.width;
    const currentLeft = currentItem.transform[4];
    return currentLeft - previousRight > MIN_SPACE_GAP;
  }

  return false;
};

const extractPageText = (items: unknown[]): string => {
  const chunks: string[] = [];
  let previousItem: ExtractableTextItem | null = null;

  for (const item of items) {
    if (!isExtractableTextItem(item)) {
      continue;
    }

    const text = item.str.replaceAll('\0', '');
    if (!text && !item.hasEOL) {
      previousItem = item;
      continue;
    }

    if (shouldInsertLineBreak(previousItem, item) && chunks.at(-1) !== '\n') {
      chunks.push('\n');
    } else if (shouldInsertSpace(previousItem, item)) {
      chunks.push(' ');
    }

    if (text) {
      chunks.push(text);
    }

    if (item.hasEOL && chunks.at(-1) !== '\n') {
      chunks.push('\n');
    }

    previousItem = item;
  }

  return normalizeExtractedText(chunks.join(''));
};

export class PdfTextExtractor {
  constructor(private readonly pdfDocument: PDFDocumentProxy) {}

  async getEarlierPageText(selectedPage: number): Promise<string> {
    if (selectedPage <= 1) {
      return '';
    }

    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber < selectedPage; pageNumber += 1) {
      const page = await this.pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = extractPageText(textContent.items);

      if (pageText) {
        pageTexts.push(pageText);
      }
    }

    return pageTexts.join('\n\n');
  }
}
