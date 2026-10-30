// Loaded lazily in the browser only: keeps CodeMirror out of the initial bundle.
import { autocompletion, closeBrackets, closeBracketsKeymap, completeFromList, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { bracketMatching, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { classHighlighter } from '@lezer/highlight';
import { FLAT_ITEMS } from '../content/catalog';

export interface EditorHandle {
  getValue(): string;
  setValue(value: string): void;
  focus(): void;
  destroy(): void;
}

interface EditorOptions {
  doc: string;
  label: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

const rxjsNames = [
  ...new Set([
    ...FLAT_ITEMS.map((i) => i.item.id).filter((id) => /^[a-zA-Z]+$/.test(id) && id !== 'unsubscribeSeveral'),
    'pipe',
    'subscribe',
    'unsubscribe',
    'Observable',
    'Subject',
    'BehaviorSubject',
    'ReplaySubject',
    'AsyncSubject',
    'Subscription',
    'asyncScheduler',
    'asapScheduler',
    'queueScheduler',
    'animationFrameScheduler',
  ]),
].map((label) => ({ label, type: /^[A-Z]/.test(label) ? 'class' : 'function', detail: 'rxjs' }));

const theme = EditorView.theme(
  {
    '&': { backgroundColor: 'transparent', color: 'var(--clear)', fontSize: '14px' },
    '.cm-scroller': { fontFamily: 'var(--mono)', lineHeight: '1.65' },
    '.cm-content': { padding: '16px 0', caretColor: 'var(--pink)' },
    '.cm-line': { padding: '0 16px 0 8px' },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: 'rgba(245,242,240,0.28)',
      border: 'none',
      paddingLeft: '8px',
    },
    '.cm-lineNumbers .cm-gutterElement': { minWidth: '2.2ch', padding: '0 6px 0 4px' },
    '.cm-activeLine': { backgroundColor: 'rgba(242,153,251,0.06)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--pink)' },
    '.cm-cursor, .cm-dropCursor': { borderLeft: '2px solid var(--pink)' },
    '&.cm-focused': { outline: 'none' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'rgba(163,254,255,0.18) !important',
    },
    '.cm-matchingBracket': { backgroundColor: 'rgba(163,254,255,0.18)', outline: '1px solid rgba(163,254,255,0.4)' },
    '.cm-tooltip': {
      backgroundColor: 'var(--surface-solid)',
      border: '1px solid var(--border-strong)',
      borderRadius: '10px',
      overflow: 'hidden',
    },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'rgba(242,153,251,0.2)', color: 'var(--clear)' },
    '.cm-completionDetail': { color: 'var(--cyan)', fontStyle: 'normal', marginLeft: '0.6em' },
  },
  { dark: true },
);

export function createEditor(parent: HTMLElement, options: EditorOptions): EditorHandle {
  let silent = false;
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: options.doc,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        javascript({ typescript: true }),
        javascriptLanguage.data.of({ autocomplete: completeFromList(rxjsNames) }),
        syntaxHighlighting(classHighlighter),
        EditorState.tabSize.of(2),
        keymap.of([
          { key: 'Mod-Enter', run: () => (options.onRun(), true) },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        EditorView.contentAttributes.of({ 'aria-label': options.label, spellcheck: 'false' }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !silent) options.onChange(update.state.doc.toString());
        }),
        theme,
      ],
    }),
  });

  return {
    getValue: () => view.state.doc.toString(),
    setValue: (value: string) => {
      silent = true;
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
      silent = false;
    },
    focus: () => view.focus(),
    destroy: () => view.destroy(),
  };
}
