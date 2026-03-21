export class PdfDocumentLoader {
  async loadFromFile(file: File): Promise<ArrayBuffer> {
    return file.arrayBuffer();
  }
}
