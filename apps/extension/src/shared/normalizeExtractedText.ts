const SPACE_EXCEPT_NEWLINES_PATTERN = /[^\S\n]+/g;
const SPACES_AROUND_NEWLINES_PATTERN = / *\n */g;
const EXCESS_NEWLINES_PATTERN = /\n{3,}/g;

export function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(SPACE_EXCEPT_NEWLINES_PATTERN, ' ')
    .replace(SPACES_AROUND_NEWLINES_PATTERN, '\n')
    .replace(EXCESS_NEWLINES_PATTERN, '\n\n')
    .trim();
}
