import type { PDFDocumentProxy } from 'pdfjs-dist';

import { PdfTextExtractor } from '../pdf/PdfTextExtractor';
import { BoundaryError, toBoundaryError } from './BoundaryError';
import { LocalContextExtractor } from './LocalContextExtractor';
import { PageBoundaryResolver } from './PageBoundaryResolver';
import { SelectedPagePrefixExtractor } from './SelectedPagePrefixExtractor';
import type { SelectionState } from './types';

export type SafePrefixBuildResult = {
  selectedPage: number;
  earlierPagesText: string;
  selectedPagePrefix: string;
  prefixText: string;
  localContext: string;
};

export type SafePrefixBuilderOptions = {
  root: HTMLElement;
  pdfDocument: PDFDocumentProxy;
  pdfTextExtractor?: PdfTextExtractor;
  selectedPagePrefixExtractor?: SelectedPagePrefixExtractor;
  localContextExtractor?: LocalContextExtractor;
};

export class SafePrefixBuilder {
  private readonly pageBoundaryResolver: PageBoundaryResolver;
  private readonly pdfTextExtractor: PdfTextExtractor;
  private readonly selectedPagePrefixExtractor: SelectedPagePrefixExtractor;
  private readonly localContextExtractor: LocalContextExtractor;

  constructor(options: SafePrefixBuilderOptions) {
    this.pageBoundaryResolver = new PageBoundaryResolver(options.root);
    this.pdfTextExtractor = options.pdfTextExtractor ?? new PdfTextExtractor(options.pdfDocument);
    this.selectedPagePrefixExtractor =
      options.selectedPagePrefixExtractor ?? new SelectedPagePrefixExtractor();
    this.localContextExtractor = options.localContextExtractor ?? new LocalContextExtractor();
  }

  async build(selection: SelectionState): Promise<SafePrefixBuildResult> {
    if (!selection.selectionRange || !selection.selectedText.trim()) {
      throw toBoundaryError(selection);
    }

    const boundaryResolution = this.pageBoundaryResolver.resolve(selection.selectionRange);
    if (boundaryResolution.kind === 'outsideTextLayer') {
      throw new BoundaryError('outsideTextLayer');
    }

    if (boundaryResolution.kind === 'multiPage') {
      throw new BoundaryError('multiPageSelection');
    }

    if (selection.selectedPage !== null && selection.selectedPage !== boundaryResolution.selectedPage) {
      throw new BoundaryError('pageResolutionFailed');
    }

    const selectedPage = boundaryResolution.selectedPage;
    const earlierPagesText = await this.pdfTextExtractor.getEarlierPageText(selectedPage);
    const selectedPagePrefix = this.selectedPagePrefixExtractor.extract(selection.selectionRange);
    const prefixText = this.joinParts(earlierPagesText, selectedPagePrefix);

    if (!prefixText) {
      throw new BoundaryError('prefixExtractionFailed');
    }

    const localContext = this.localContextExtractor.extract(prefixText, selection.selectedText);
    if (!localContext) {
      throw new BoundaryError('prefixExtractionFailed');
    }

    return {
      selectedPage,
      earlierPagesText,
      selectedPagePrefix,
      prefixText,
      localContext
    };
  }

  private joinParts(earlierPagesText: string, selectedPagePrefix: string): string {
    return [earlierPagesText, selectedPagePrefix].filter(Boolean).join('\n\n').trim();
  }
}
