// @vitest-environment jsdom

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { SelectionController } from './SelectionController';

const TEST_RECT = {
  top: 32,
  right: 128,
  bottom: 64,
  left: 48,
  width: 80,
  height: 32
} as DOMRect;

const originalGetBoundingClientRect = Object.getOwnPropertyDescriptor(
  Range.prototype,
  'getBoundingClientRect'
);

beforeAll(() => {
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
    configurable: true,
    value() {
      return TEST_RECT;
    }
  });
});

afterAll(() => {
  if (originalGetBoundingClientRect) {
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', originalGetBoundingClientRect);
    return;
  }

  Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
});

afterEach(() => {
  document.getSelection()?.removeAllRanges();
  document.body.innerHTML = '';
});

const setupReaderDom = () => {
  document.body.innerHTML = `
    <div id="reader">
      <div class="page" data-page-number="4">
        <div class="textLayer">
          <span id="page4-target">Darcy</span>
        </div>
        <div id="page4-note">Margin note</div>
      </div>
      <div class="page" data-page-number="5">
        <div class="textLayer">
          <span id="page5-target">Bingley</span>
        </div>
      </div>
    </div>
    <div id="outside">Outside reader</div>
  `;

  return {
    root: document.getElementById('reader') as HTMLElement,
    page4Target: document.getElementById('page4-target') as HTMLSpanElement,
    page4Note: document.getElementById('page4-note') as HTMLDivElement,
    page5Target: document.getElementById('page5-target') as HTMLSpanElement,
    outside: document.getElementById('outside') as HTMLDivElement
  };
};

const selectNodeContents = (node: Node): void => {
  const range = document.createRange();
  range.selectNodeContents(node);

  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

const selectAcrossNodes = (startNode: Node, endNode: Node): void => {
  const startText = startNode.firstChild;
  const endText = endNode.firstChild;
  if (!startText || !endText) {
    throw new Error('Expected both nodes to contain text.');
  }

  const range = document.createRange();
  range.setStart(startText, 0);
  range.setEnd(endText, endText.textContent?.length ?? 0);

  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

describe('SelectionController', () => {
  it('tracks valid single-page selections inside the PDF.js text layer', () => {
    const { root, page4Target } = setupReaderDom();
    selectNodeContents(page4Target);

    const controller = new SelectionController({
      ownerDocument: document,
      root
    });

    controller.start();

    expect(controller.getCurrentSelection()).toMatchObject({
      selectedText: 'Darcy',
      selectedPage: 4,
      isValid: true,
      anchorRect: {
        top: TEST_RECT.top,
        right: TEST_RECT.right,
        bottom: TEST_RECT.bottom,
        left: TEST_RECT.left,
        width: TEST_RECT.width,
        height: TEST_RECT.height
      }
    });

    controller.destroy();
  });

  it('pushes updated state to subscribers when the browser selection changes', () => {
    const { root, page4Target } = setupReaderDom();
    const observedTexts: string[] = [];

    const controller = new SelectionController({
      ownerDocument: document,
      root
    });

    controller.subscribe((selection) => {
      observedTexts.push(selection.selectedText);
    });

    controller.start();
    selectNodeContents(page4Target);
    document.dispatchEvent(new Event('selectionchange'));

    expect(observedTexts).toContain('Darcy');
    expect(controller.getCurrentSelection().isValid).toBe(true);

    controller.destroy();
  });

  it('marks selections outside the PDF.js text layer as invalid', () => {
    const { root, page4Note } = setupReaderDom();
    selectNodeContents(page4Note);

    const controller = new SelectionController({
      ownerDocument: document,
      root
    });

    controller.start();

    expect(controller.getCurrentSelection()).toMatchObject({
      selectedText: 'Margin note',
      selectedPage: null,
      isValid: false,
      invalidReason: 'Please select text inside the PDF text layer.'
    });

    controller.destroy();
  });

  it('marks multi-page selections as invalid', () => {
    const { root, page4Target, page5Target } = setupReaderDom();
    selectAcrossNodes(page4Target, page5Target);

    const controller = new SelectionController({
      ownerDocument: document,
      root
    });

    controller.start();

    expect(controller.getCurrentSelection()).toMatchObject({
      selectedPage: null,
      isValid: false,
      invalidReason: 'Please select text on a single page.'
    });

    controller.destroy();
  });
});
