import { NgTemplateOutlet } from '@angular/common';
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
} from '@angular/core';
import { MarbleData, MarbleLane } from '../content/model';
import { TranslatePipe } from '../core/i18n/translate.pipe';

const WIDTH = 600;
const LANE_H = 52;
const BOX_H = 40;
const BOX_GAP = 12;
const TOP = 14;
const GUTTER = 78;
const RIGHT = 34;
const MARBLE_H = 30;

interface Marble {
  x: number;
  width: number;
  label: string;
  tone: 'pink' | 'cyan' | 'grad';
}

interface Lane {
  y: number;
  label?: string;
  marbles: Marble[];
  complete?: number;
  error?: number;
}

const toneOf = (label: string): Marble['tone'] =>
  /^[a-z]$/.test(label) ? 'pink' : /^\d+$/.test(label) ? 'cyan' : 'grad';

@Component({
  selector: 'app-marble-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, TranslatePipe],
  templateUrl: './marble-diagram.html',
  styleUrl: './marble-diagram.scss',
})
export class MarbleDiagram {
  readonly data = input.required<MarbleData>();

  /** The sweep plays once, the first time the diagram is on screen. */
  protected readonly playing = signal(false);

  protected readonly width = WIDTH;
  protected readonly lineEnd = WIDTH - 16;
  protected readonly marbleH = MARBLE_H;

  private readonly x0 = computed(() =>
    [...this.data().inputs, ...this.data().outputs].some((l) => l.label) ? GUTTER : 22,
  );
  protected readonly lineStart = computed(() => this.x0() - 12);

  protected readonly inputs = computed(() => this.data().inputs.map((l, i) => this.lane(l, TOP + LANE_H * i + LANE_H / 2)));
  protected readonly boxY = computed(() => TOP + LANE_H * this.data().inputs.length + (this.data().inputs.length ? BOX_GAP : 0));
  protected readonly boxH = BOX_H;
  protected readonly outputs = computed(() =>
    this.data().outputs.map((l, i) => this.lane(l, this.boxY() + BOX_H + BOX_GAP + LANE_H * i + LANE_H / 2)),
  );
  protected readonly height = computed(() => this.boxY() + BOX_H + BOX_GAP + LANE_H * this.data().outputs.length + 10);

  protected readonly summary = computed(() =>
    this.data()
      .outputs.map((l) => `${l.label ? `${l.label}: ` : ''}${l.events.map((e) => e.v).join(', ')}`)
      .join(' | '),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          this.playing.set(true);
        },
        { threshold: 0.4 },
      );
      observer.observe(host.querySelector('svg')!);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private lane(source: MarbleLane, y: number): Lane {
    const x0 = this.x0();
    const span = WIDTH - RIGHT - x0 - 14;
    const xOf = (t: number) => x0 + 14 + (t / this.data().duration) * span;
    const max = WIDTH - RIGHT + 8;

    const marbles: Marble[] = source.events.map((e) => ({
      x: xOf(e.t),
      width: Math.max(MARBLE_H, e.v.length * 8.4 + 14),
      label: e.v,
      tone: toneOf(e.v),
    }));
    // Simultaneous values sit side by side, keeping their order
    for (let i = 1; i < marbles.length; i++) {
      const min = marbles[i - 1].x + (marbles[i - 1].width + marbles[i].width) / 2 + 3;
      if (marbles[i].x < min) marbles[i].x = min;
    }
    const last = marbles.at(-1);
    if (last && last.x + last.width / 2 > max) {
      last.x = max - last.width / 2;
      for (let i = marbles.length - 2; i >= 0; i--) {
        const limit = marbles[i + 1].x - (marbles[i + 1].width + marbles[i].width) / 2 - 3;
        if (marbles[i].x > limit) marbles[i].x = limit;
      }
    }

    const tail = last ? last.x + last.width / 2 + 7 : 0;
    const end = (t?: number) => (t === undefined ? undefined : Math.min(Math.max(xOf(t), tail), max + 8));
    return { y, label: source.label, marbles, complete: end(source.complete), error: end(source.error) };
  }
}
