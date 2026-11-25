import { createEditor } from './editor';

describe('createEditor', () => {
  let parent: HTMLElement;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  afterEach(() => parent.remove());

  const create = () => {
    const onChange = vi.fn();
    const onRun = vi.fn();
    const editor = createEditor(parent, { doc: 'of(1)', label: 'Editor: map', onChange, onRun });
    return { editor, onChange, onRun, content: parent.querySelector<HTMLElement>('.cm-content')! };
  };

  it('mounts CodeMirror with the document and an accessible label', () => {
    const { editor, content } = create();
    expect(parent.querySelector('.cm-editor')).not.toBeNull();
    expect(editor.getValue()).toBe('of(1)');
    expect(content.getAttribute('aria-label')).toBe('Editor: map');
    expect(content.getAttribute('spellcheck')).toBe('false');
    editor.destroy();
    expect(parent.querySelector('.cm-editor')).toBeNull();
  });

  it('replaces the document without reporting it as a user change', () => {
    const { editor, onChange } = create();
    editor.setValue('interval(1000)');
    expect(editor.getValue()).toBe('interval(1000)');
    expect(onChange).not.toHaveBeenCalled();
    editor.destroy();
  });

  it('reports user edits', async () => {
    const { editor, onChange } = create();
    const view = (await import('@codemirror/view')).EditorView.findFromDOM(
      parent.querySelector('.cm-editor')!,
    )!;
    view.dispatch({ changes: { from: 5, insert: '.pipe()' } });
    expect(onChange).toHaveBeenCalledWith('of(1).pipe()');
    editor.destroy();
  });

  it('runs the code with Ctrl+Enter and takes the focus', () => {
    const { editor, onRun, content } = create();
    editor.focus();
    content.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(onRun).toHaveBeenCalledTimes(1);
    editor.destroy();
  });
});
