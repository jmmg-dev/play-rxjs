import { classHighlighter, highlightCode } from '@lezer/highlight';
import { parser } from '@lezer/javascript';

const tsParser = parser.configure({ dialect: 'ts' });

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Highlights TypeScript into HTML lines using the same token classes (`tok-*`) as the editor,
 * so the server rendered snippet and the live CodeMirror instance look identical.
 */
export function highlightLines(code: string): string[] {
  const lines: string[] = [''];
  highlightCode(
    code,
    tsParser.parse(code),
    classHighlighter,
    (text, classes) => {
      lines[lines.length - 1] += classes ? `<span class="${classes}">${escape(text)}</span>` : escape(text);
    },
    () => lines.push(''),
  );
  return lines;
}
