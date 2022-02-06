/* eslint-disable @typescript-eslint/no-empty-function */
import { Loadable, Loader } from '../loader';
import { timestamp, PartialBy } from '../utils';

export interface Game {
  init?: () => void;
  width: number;
  height: number;
  start: (numPlayers: number) => void;
  stop: () => void;
  update: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  onkeyup?: (ev: KeyboardEvent) => void;
  onkeydown?: (ev: KeyboardEvent) => void;
}

export interface IGameOptions {
  fps?: number;
  stats?: boolean;
  width?: number;
  height?: number;
  canvasElementId?: string;
}

const defaultOptions: IGameOptions = {
  fps: 60,
  stats: true,
  width: 640,
  height: 480,
  canvasElementId: 'game',
};

export class Engine {
  private _options: IGameOptions;

  private _timer: ReturnType<typeof setInterval>;

  private _lastFrame: number;

  private _fps: number;

  private _interval: number;

  private _canvasElementId: string;

  private _width: number;

  private _height: number;

  private _front: HTMLCanvasElement;

  private _back: HTMLCanvasElement;

  private _front2d: CanvasRenderingContext2D;

  private _back2d: CanvasRenderingContext2D;

  private _loader: Loader;

  private _isLoading = false;

  private _hasStarted = false;

  private _stats = {
    count: 0,
    fps: 0,
    update: 0,
    draw: 0,
    frame: 0, // update + draw
  };

  constructor(
    private game: Game,
    options?: PartialBy<IGameOptions, 'canvasElementId'>
  ) {
    // For some inspiration how to include options to a TypeScript class
    // https://github.com/microsoft/vscode/blob/main/src/vs/editor/contrib/zoneWidget/zoneWidget.ts
    this._options = { ...defaultOptions, ...options };

    this._fps = this._options.fps;
    this._interval = 1000.0 / this._options.fps;

    // Set or create the front canvas element
    if (this._options.canvasElementId) {
      this._front = <HTMLCanvasElement>(
        document.getElementById(this._options.canvasElementId)
      );
    } else {
      this._front = <HTMLCanvasElement>document.createElement('canvas');
    }

    // Create a back canvas element
    this._back = <HTMLCanvasElement>document.createElement('canvas');

    this._width = this.game.width;
    this._height = this.game.height;

    this._front.width = this._back.width = this._width;
    this._front.height = this._back.height = this._height;

    this._front2d = this._front.getContext('2d');
    this._back2d = this._back.getContext('2d');

    this._loader = new Loader();

    this.addEvents();
  }

  async start(loader?: Loader): Promise<void> {
    // if (!this._compatible) {
    //   return Promise.reject('This game is incompatible with your browser');
    // }
    let loadingComplete: Promise<void>;
    if (loader) {
      this._loader = loader;
      loadingComplete = this.load(this._loader);
    } else {
      loadingComplete = Promise.resolve();
    }
    await loadingComplete;

    // Give an options to call and async init in the case the game requires loading resources
    this.game.init?.();

    this._lastFrame = timestamp();
    this._timer = setInterval(() => {
      this.loop();
    }, this._interval);
  }

  public load(loader: Loadable<unknown>): Promise<void> {
    const complete = new Promise<void>((resolve) => {
      this._isLoading = true;
      loader.load().then(() => {
        this._isLoading = false;
        resolve();
      });
    });

    return complete;
  }

  stop(): void {
    clearInterval(this._timer);
  }

  loop(): void {
    const start = timestamp();
    this.update((start - this._lastFrame) / 1000.0); // send dt as seconds

    const middle = timestamp();
    this.draw();

    const end = timestamp();
    this.updateStats(middle - start, end - middle);
    this._lastFrame = start;
  }

  update(dt: number): void {
    // might as well let the engine watch key press and inform the game on every update rather than pass through
    // with an eventing
    this.game.update(dt);
  }

  draw(): void {
    this._back2d.clearRect(0, 0, this._width, this._height);
    this.game.draw(this._back2d);
    this.drawStats(this._back2d);
    this._front2d.clearRect(0, 0, this._width, this._height);
    this._front2d.drawImage(this._back, 0, 0);
  }

  resetStats() {
    this._stats = {
      count: 0,
      fps: 0,
      update: 0,
      draw: 0,
      frame: 0, // update + draw
    };
  }

  updateStats(update: number, draw: number) {
    if (this._options.stats) {
      this._stats.update = Math.max(1, update);
      this._stats.draw = Math.max(1, draw);
      this._stats.frame = this._stats.update + this._stats.draw;
      this._stats.count =
        this._stats.count == this._fps ? 0 : this._stats.count + 1;
      this._stats.fps = Math.min(this._fps, 1000 / this._stats.frame);
    }
  }

  drawStats(ctx: CanvasRenderingContext2D) {
    if (this._options.stats) {
      ctx.fillText(
        'frame: ' + this._stats.count,
        this._width - 100,
        this._height - 60
      );
      ctx.fillText(
        'fps: ' + this._stats.fps,
        this._width - 100,
        this._height - 50
      );
      ctx.fillText(
        'update: ' + this._stats.update + 'ms',
        this._width - 100,
        this._height - 40
      );
      ctx.fillText(
        'draw: ' + this._stats.draw + 'ms',
        this._width - 100,
        this._height - 30
      );
    }
  }

  addEvents() {
    document.addEventListener('keyup', this.onkeyup.bind(this), false);
    document.addEventListener('keydown', this.onkeydown.bind(this), false);
  }

  onkeyup(ev: KeyboardEvent) {
    if (this.game.onkeyup) this.game.onkeyup(ev);
  }

  onkeydown(ev: KeyboardEvent) {
    if (this.game.onkeydown) this.game.onkeydown(ev);
  }

  hideCurser() {
    this._front.style.cursor = 'none';
  }

  showCurser() {
    this._front.style.cursor = 'auto';
  }

  alert(msg: string) {
    this.stop(); // alert blocks thread, so need to stop game loop in order to avoid sending huge dt values to next update
    const result = window.alert(msg);
    this.start();
    return result;
  }

  confirm(msg: string) {
    this.stop(); // alert blocks thread, so need to stop game loop in order to avoid sending huge dt values to next update
    const result = window.confirm(msg);
    this.start();
    return result;
  }

  showStats(show: boolean) {
    this._options.stats = show;
  }

  static random(min: number, max: number) {
    return min + Math.random() * (max - min);
  }
}
