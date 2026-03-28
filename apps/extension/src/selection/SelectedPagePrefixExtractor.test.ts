// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import { BoundaryError } from './BoundaryError';
import { SelectedPagePrefixExtractor } from './SelectedPagePrefixExtractor';

const createRangeForText = (node: Node, startOffset: number, endOffset: number): Range => {
  const range = document.createRange();
  range.setStart(node, startOffset);
  range.setEnd(node, endOffset);
  return range;
};

describe('SelectedPagePrefixExtractor', () => {
  it('extracts text from the start of the page text layer to the selection end', () => {
    document.body.innerHTML = `
      <div class="page" data-page-number="4">
        <div class="textLayer">
          <span id="before">Elizabeth looked at </span>
          <span id="target">Darcy</span>
          <span id="after"> and smiled.</span>
        </div>
      </div>
    `;

    const target = document.getElementById('target');
    const targetText = target?.firstChild;
    if (!targetText) {
      throw new Error('Expected target text node.');
    }

    const extractor = new SelectedPagePrefixExtractor();
    const result = extractor.extract(createRangeForText(targetText, 0, targetText.textContent?.length ?? 0));

    expect(result).toBe('Elizabeth looked at Darcy');
  });

  it('rejects selections that do not end inside the PDF text layer', () => {
    document.body.innerHTML = `
      <div class="page" data-page-number="4">
        <div id="note">Margin note</div>
      </div>
    `;

    const note = document.getElementById('note');
    const noteText = note?.firstChild;
    if (!noteText) {
      throw new Error('Expected note text node.');
    }

    const extractor = new SelectedPagePrefixExtractor();

    expect(() => {
      extractor.extract(createRangeForText(noteText, 0, noteText.textContent?.length ?? 0));
    }).toThrowError(BoundaryError);
  });
});
