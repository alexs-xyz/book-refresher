export class SafePrefixBuilder {
  build(earlierPagesText: string, selectedPagePrefix: string): string {
    return [earlierPagesText, selectedPagePrefix].filter(Boolean).join('\n\n');
  }
}
