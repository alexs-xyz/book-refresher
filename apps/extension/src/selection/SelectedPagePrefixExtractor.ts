import { normalizeExtractedText } from '../shared/normalizeExtractedText';
import { BoundaryError } from './BoundaryError';

const getOwningElement = (node: Node): Element | null => {
  return node instanceof Element ? node : node.parentElement;
};

export class SelectedPagePrefixExtractor {
  extract(selectionRange: Range): string {
    const textLayer = this.findTextLayer(selectionRange.endContainer);
    if (!textLayer) {
      throw new BoundaryError('outsideTextLayer');
    }

    const prefixRange = selectionRange.cloneRange();
    prefixRange.selectNodeContents(textLayer);
    prefixRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);

    const prefixText = normalizeExtractedText(
      (prefixRange.cloneContents().textContent ?? '').replace(/\n+/g, ' ')
    );
    if (!prefixText) {
      throw new BoundaryError('prefixExtractionFailed');
    }

    return prefixText;
  }

  private findTextLayer(node: Node): HTMLElement | null {
    const element = getOwningElement(node);
    const textLayer = element?.closest('.textLayer');

    return textLayer instanceof HTMLElement ? textLayer : null;
  }
}
