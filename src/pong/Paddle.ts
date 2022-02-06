import { Colors, Level, Levels } from './Pong';
import { Direction, Drawable, Updatable } from '../utils';
import { Ball } from './Ball';
import { Engine } from '../engine/Engine';

/* eslint-disable @typescript-eslint/no-empty-function */
interface PaddleOptions {
  rightHandSide?: boolean;
  paddleWidth: number;
  paddleHeight: number;
  paddleSpeed: number;
  wallWidth: number;
  height: number;
  width: number;
  showPredictions: boolean;
}

interface Predication {
  x: number;
  y: number;
  d: Direction;
  dx: number;
  dy: number;
  exactX: number;
  exactY: number;
  radius: number;
  since: number;
}

export class Paddle implements Drawable, Updatable {
  private width: number;

  private height: number;

  private paddleWidth: number;

  private paddleHeight: number;

  private minY: number;

  private maxY: number;

  private speed: number;

  private x: number;

  private y: number;

  private _left: number;

  private _right: number;

  private _top: number;

  private _bottom: number;

  private _up: number;

  private _down: number;

  private _auto = false;

  private level: Level;

  private prediction: Predication;

  public showPredications: boolean;

  constructor(options: PaddleOptions) {
    const {
      rightHandSide,
      paddleWidth,
      paddleHeight,
      paddleSpeed,
      wallWidth,
      height,
      width,
      showPredictions,
    } = options;

    this.width = width;
    this.height = height;
    this.paddleWidth = paddleWidth;
    this.paddleHeight = paddleHeight;
    this.minY = wallWidth;
    this.maxY = height - wallWidth - this.paddleHeight;
    this.speed = (this.maxY - this.minY) / paddleSpeed;
    this.setpos(
      rightHandSide ? width - paddleWidth : 0,
      this.minY + (this.maxY - this.minY) / 2
    );
    this.setdir(0);
    this.level = Levels[8];
    this.showPredications = showPredictions;
  }

  setpos(x: number, y: number) {
    this.x = x;
    this.y = y;
    this._left = this.x;
    this._right = this._left + this.paddleWidth;
    this._top = this.y;
    this._bottom = this.y + this.paddleHeight;
  }

  setdir(dy: number) {
    this._up = dy < 0 ? -dy : 0;
    this._down = dy > 0 ? dy : 0;
  }

  setAuto(on: boolean): void;
  setAuto(on: boolean, level: number): void;
  setAuto(on: boolean, level?: number) {
    if (on && !this._auto && level) {
      this._auto = true;
      this.setLevel(level);
    } else if (!on && this._auto) {
      this._auto = false;
      this.setdir(0);
    }
  }

  get right() {
    return this._right;
  }

  get left() {
    return this._left;
  }

  get top() {
    return this._top;
  }

  get bottom() {
    return this._bottom;
  }

  get up() {
    return this._up;
  }

  get down() {
    return this._down;
  }

  get auto() {
    return this._auto;
  }

  setLevel(level: number) {
    if (this._auto) this.level = Levels[level];
  }

  update(dt: number, ball: Ball) {
    if (this._auto) {
      this.ai(dt, ball);
    }

    const amount = this._down - this._up;
    if (amount !== 0) {
      let y = this.y + amount * dt * this.speed;
      if (y < this.minY) {
        y = this.minY;
      } else if (y > this.maxY) {
        y = this.maxY;
      }
      this.setpos(this.x, y);
    }
  }

  ai(dt: number, ball: Ball) {
    if (
      (ball.x < this._left && ball.dx < 0) ||
      (ball.x > this._right && ball.dx > 0)
    ) {
      this.stopMovingUp();
      this.stopMovingDown();
    } else {
      this.predict(dt, ball);
      if (this.prediction) {
        if (this.prediction.y < this._top + this.paddleHeight / 2 - 5) {
          this.stopMovingDown();
          this.moveUp();
        } else if (
          this.prediction.y >
          this._bottom - this.paddleHeight / 2 + 5
        ) {
          this.stopMovingUp();
          this.moveDown();
        } else {
          this.stopMovingUp();
          this.stopMovingDown();
        }
      }
    }
  }

  predict(dt: number, ball: Ball) {
    // only re-predict if the ball changed direction, or its been some amount of time since last prediction
    if (
      this.prediction &&
      this.prediction.dx * ball.dx > 0 &&
      this.prediction.dy * ball.dy > 0 &&
      this.prediction.since < this.level.aiReaction
    ) {
      this.prediction.since += dt;
    } else {
      const pt = ball.intercept(
        {
          left: this._left,
          right: this._right,
          top: -10000,
          bottom: 10000,
        },
        ball.dx * 10,
        ball.dy * 10
      );

      if (pt) {
        const t = this.minY + ball.radius;
        const b = this.maxY + this.height - ball.radius;

        while (pt.y < t || pt.y > b) {
          if (pt.y < t) {
            pt.y = t + (t - pt.y);
          } else if (pt.y > b) {
            pt.y = t + (b - t) - (pt.y - b);
          }
        }
        this.prediction = {
          since: 0,
          dx: ball.dx,
          dy: ball.dy,
          x: pt.x,
          y: pt.y,
          radius: ball.radius,
          exactX: pt.x,
          exactY: pt.y,
          d: pt.d,
        };
        const closeness =
          (ball.dx < 0 ? ball.x - this._right : this._left - ball.x) /
          this.width;
        const error = this.level.aiError * closeness;
        this.prediction.y = this.prediction.y + Engine.random(-error, error);
      } else {
        this.prediction = null;
      }
    }
  }

  moveUp() {
    this._up = 1;
  }

  moveDown() {
    this._down = 1;
  }

  stopMovingUp() {
    this._up = 0;
  }

  stopMovingDown() {
    this._down = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = Colors.walls;
    ctx.fillRect(this.x, this.y, this.paddleWidth, this.paddleHeight);
    if (this.prediction && this.showPredications) {
      ctx.strokeStyle = Colors.predictionExact;
      ctx.strokeRect(
        this.prediction.x - this.prediction.radius,
        this.prediction.exactY - this.prediction.radius,
        this.prediction.radius * 2,
        this.prediction.radius * 2
      );
      ctx.strokeStyle = Colors.predictionGuess;
      ctx.strokeRect(
        this.prediction.x - this.prediction.radius,
        this.prediction.y - this.prediction.radius,
        this.prediction.radius * 2,
        this.prediction.radius * 2
      );
    }
  }
}
