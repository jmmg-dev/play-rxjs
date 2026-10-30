import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { UiControl } from '../content/model';
import { I18n } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Icon } from '../shared/icon';
import { highlightLines } from './highlight';
import type { EditorHandle } from './editor';
import { LogLevel, Sandbox } from './sandbox';

interface LogEntry {
  id: number;
  level: LogLevel;
  text: string;
  time: string;
}

const MAX_LOGS = 300;

@Component({
  selector: 'app-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  templateUrl: './playground.html',
  styleUrl: './playground.scss',
})
export class Playground {
  readonly code = input.required<string>();
  readonly ui = input<UiControl[]>([]);
  readonly name = input.required<string>();

  private readonly i18n = inject(I18n);
  private readonly cmHost = viewChild.required<ElementRef<HTMLElement>>('cmHost');
  private readonly frameHost = viewChild.required<ElementRef<HTMLElement>>('frameHost');
  private readonly consoleList = viewChild<ElementRef<HTMLElement>>('consoleList');

  protected readonly lines = computed(() => highlightLines(this.code()));
  protected readonly current = signal<string | null>(null);
  protected readonly modified = computed(() => this.current() !== null && this.current() !== this.code());
  protected readonly running = signal(false);
  protected readonly editorReady = signal(false);
  protected readonly logs = signal<LogEntry[]>([]);
  protected readonly frameHeight = signal(0);

  private editor?: EditorHandle;
  private editorLoading?: Promise<void>;
  private sandbox?: Sandbox;
  private startedAt = 0;
  private logId = 0;
  private destroyed = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.sandbox = new Sandbox(this.frameHost().nativeElement, {
        onLog: (level, text) => this.push(level, text),
        onHeight: (height) => this.frameHeight.set(height),
      });
      // Upgrade the static snippet to a full editor when the browser is idle
      if ('requestIdleCallback' in window) requestIdleCallback(() => this.loadEditor(), { timeout: 4000 });
      else setTimeout(() => this.loadEditor(), 1500);
    });
    destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.sandbox?.destroy();
      this.editor?.destroy();
    });
  }

  protected loadEditor(): Promise<void> {
    this.editorLoading ??= import('./editor').then(({ createEditor }) => {
      if (this.destroyed) return;
      this.editor = createEditor(this.cmHost().nativeElement, {
        doc: this.current() ?? this.code(),
        label: `${this.i18n.t('ui.editorLabel')}: ${this.name()}`,
        onChange: (value) => this.current.set(value),
        onRun: () => this.run(),
      });
      this.editorReady.set(true);
    });
    return this.editorLoading;
  }

  protected async focusEditor(): Promise<void> {
    await this.loadEditor();
    this.editor?.focus();
  }

  async run(): Promise<void> {
    const source = this.editor?.getValue() ?? this.current() ?? this.code();
    this.logs.set([]);
    this.startedAt = performance.now();
    let compiled: string;
    try {
      const { transpile } = await import('./transpile');
      compiled = transpile(source);
    } catch (err) {
      this.stop();
      this.push('error', `${this.i18n.t('ui.compileError')}: ${(err as Error).message}`);
      return;
    }
    if (this.destroyed) return;
    this.running.set(true);
    this.sandbox?.run(compiled, this.ui(), {
      running: this.i18n.t('ui.running'),
      helpers: source.includes('userService') ? this.i18n.t('ui.sandboxHelpers') : '',
      label: (key) => this.i18n.t(`ui.buttons.${key}`),
    });
  }

  stop(): void {
    this.sandbox?.stop();
    this.running.set(false);
    this.frameHeight.set(0);
  }

  reset(): void {
    this.stop();
    this.logs.set([]);
    this.current.set(null);
    this.editor?.setValue(this.code());
  }

  protected clear(): void {
    this.logs.set([]);
  }

  private push(level: LogLevel, text: string): void {
    const seconds = this.startedAt ? (performance.now() - this.startedAt) / 1000 : 0;
    const entry: LogEntry = { id: ++this.logId, level, text, time: `${seconds.toFixed(1)}s` };
    this.logs.update((logs) => [...logs.slice(-(MAX_LOGS - 1)), entry]);
    requestAnimationFrame(() => {
      const list = this.consoleList()?.nativeElement;
      if (list) list.scrollTop = list.scrollHeight;
    });
  }
}
