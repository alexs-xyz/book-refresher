import { AnnotationMode, type PDFDocumentProxy } from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer } from 'pdfjs-dist/web/pdf_viewer.mjs';

type PdfViewerAdapterOptions = {
  container: HTMLDivElement;
  viewer: HTMLDivElement;
  onCurrentPageChange?: (pageNumber: number) => void;
};

type PageChangingEvent = {
  pageNumber?: number;
};

// PDF.js uses `1` for `TextLayerMode.ENABLE`, but that enum is not exported here.
const TEXT_LAYER_MODE_ENABLE = 1;

export class PdfViewerAdapter {
  private readonly eventBus = new EventBus();
  private readonly linkService = new PDFLinkService({ eventBus: this.eventBus });
  private readonly pdfViewer: PDFViewer;
  private zoomScale = 1;

  private readonly handlePageChanging = (event: PageChangingEvent) => {
    if (typeof event.pageNumber === 'number') {
      this.options.onCurrentPageChange?.(event.pageNumber);
    }
  };

  private readonly handlePagesInit = () => {
    this.pdfViewer.currentScale = this.zoomScale;
    this.options.onCurrentPageChange?.(this.pdfViewer.currentPageNumber);
  };

  constructor(private readonly options: PdfViewerAdapterOptions) {
    this.pdfViewer = new PDFViewer({
      container: options.container,
      viewer: options.viewer,
      eventBus: this.eventBus,
      linkService: this.linkService,
      textLayerMode: TEXT_LAYER_MODE_ENABLE,
      annotationMode: AnnotationMode.DISABLE
    });

    this.linkService.setViewer(this.pdfViewer);
    this.eventBus.on('pagechanging', this.handlePageChanging);
    this.eventBus.on('pagesinit', this.handlePagesInit);
  }

  async openDocument(pdfDocument: PDFDocumentProxy): Promise<void> {
    this.options.container.scrollTop = 0;
    this.options.container.scrollLeft = 0;
    this.linkService.setDocument(pdfDocument);
    this.pdfViewer.setDocument(pdfDocument);
    await this.pdfViewer.firstPagePromise;
    this.pdfViewer.currentScale = this.zoomScale;
    this.options.onCurrentPageChange?.(this.pdfViewer.currentPageNumber);
  }

  setZoom(zoomPercent: number): void {
    this.zoomScale = zoomPercent / 100;

    if (this.pdfViewer.pdfDocument) {
      this.pdfViewer.currentScale = this.zoomScale;
    }
  }

  destroy(): void {
    this.eventBus.off('pagechanging', this.handlePageChanging);
    this.eventBus.off('pagesinit', this.handlePagesInit);
    this.pdfViewer.cleanup();
    this.options.viewer.replaceChildren();
  }
}
