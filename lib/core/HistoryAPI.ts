import { Shape } from '../parser/core/Shape';

interface HistoryAPIContext {
  updateD(d: string): void;
}

export class HistoryAPI {
  private currentStackItem = 0;
  private ignoreNextUpdate = '';
  private stack: string[] = [];
  constructor(
    private self: HTMLElement,
    private maxSize: number,
    private context: HistoryAPIContext
  ) {}

  update(shapes: Shape[]) {
    const d = shapes.map((shape) => shape.toString()).join(' ');
    if (this.ignoreNextUpdate === d) {
      return;
    }
    this.stack = this.stack.slice(this.currentStackItem);
    this.currentStackItem = 0;
    if (!this.stack.includes(d)) {
      this.stack.unshift(d);
    }
    if (this.stack.length > this.maxSize) {
      this.stack.pop();
    }
  }

  clear() {
    this.stack = [];
    this.currentStackItem = 0;
    this.ignoreNextUpdate = '';
  }

  private onKeydown = (e: KeyboardEvent) => {
    if (!e.ctrlKey) return;
    if (e.code === 'KeyZ') {
      this.currentStackItem = Math.min(this.currentStackItem + 1, this.stack.length - 1);
      this.ignoreNextUpdate = this.stack[this.currentStackItem];
      this.context.updateD(this.ignoreNextUpdate);
    }
    if (e.code === 'KeyY') {
      this.currentStackItem = Math.max(0, this.currentStackItem - 1);
      this.ignoreNextUpdate = this.stack[this.currentStackItem];
      this.context.updateD(this.ignoreNextUpdate);
    }
  };

  public init() {
    this.stack = [''];
    this.self.addEventListener('keydown', this.onKeydown);
  }

  public destroy() {
    this.stack = [];
    this.self.removeEventListener('keydown', this.onKeydown);
  }
}
