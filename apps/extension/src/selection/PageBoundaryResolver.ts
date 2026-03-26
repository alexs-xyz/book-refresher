export type PageBoundaryResolution =
  | {
      kind: 'singlePage';
      selectedPage: number;
    }
  | {
      kind: 'outsideTextLayer';
    }
  | {
      kind: 'multiPage';
      startPage: number;
      endPage: number;
    };

export class PageBoundaryResolver {
  constructor(private readonly root: HTMLElement) {}

  resolve(range: Range): PageBoundaryResolution {
    const startPage = this.findTextLayerPageNumber(range.startContainer);
    const endPage = this.findTextLayerPageNumber(range.endContainer);

    if (startPage === null || endPage === null) {
      return { kind: 'outsideTextLayer' };
    }

    if (startPage !== endPage) {
      return {
        kind: 'multiPage',
        startPage,
        endPage
      };
    }

    return {
      kind: 'singlePage',
      selectedPage: startPage
    };
  }

  private findTextLayerPageNumber(node: Node): number | null {
    const element = node instanceof Element ? node : node.parentElement;
    if (!element || !this.root.contains(element)) {
      return null;
    }

    const textLayer = element.closest('.textLayer');
    if (!textLayer || !this.root.contains(textLayer)) {
      return null;
    }

    const page = textLayer.closest('.page');
    if (!page || !this.root.contains(page)) {
      return null;
    }

    const pageNumber = Number.parseInt(page.getAttribute('data-page-number') ?? '', 10);
    return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : null;
  }
}
