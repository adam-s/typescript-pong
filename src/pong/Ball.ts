/* eslint-disable @typescript-eslint/no-empty-function */
import { Engine } from '../engine';
import { accelerate, Drawable, intercept, Updatable } from '../utils';
import { Paddle } from '../pong';
import { Colors } from './Pong';

export interface BallOptions {
  ballRadius: number;
  width: number;
  height: number;
  wallWidth: number;
  ballSpeed: number;
  ballAccel: number;
  footprints: boolean;
}

export class Ball implements Updatable, Drawable {
  private _x = 0;

  private _y = 0;

  private _dx: number;

  private _dy: number;

  private _radius: number;

  private minX: number;

  private maxX: number;

  private minY: number;

  private maxY: number;

  private speed: number;

  private accel: number;

  // private top: number;

  // private bottom: number;

  private _left: number;

  private _right: number;

  private dxChanged = false;

  private dyChanged = false;

  private footprints: Array<{ x: number; y: number }> = [];

  private footprintCount = 0;

  public showFootprints = false;

  constructor(options: BallOptions) {
    const {
      ballRadius,
      width,
      height,
      wallWidth,
      ballSpeed,
      ballAccel,
      footprints,
    } = options;
    this.minX = this._radius = ballRadius;
    this.maxX = width - this._radius;
    this.minY = wallWidth + this._radius;
    this.maxY = height - wallWidth - this._radius;
    this.speed = (this.maxX - this.minX) / ballSpeed;
    this.accel = ballAccel;
    this.showFootprints = footprints;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get dx() {
    return this._dx;
  }

  get dy() {
    return this._dy;
  }

  get radius() {
    return this._radius;
  }

  get left() {
    return this._left;
  }

  get right() {
    return this._right;
  }

  reset(playerNumber: number | null) {
    this.footprints = [];
    this.setpos(
      playerNumber === 1 ? this.maxX : this.minX,
      Engine.random(this.minY, this.maxY)
    );
    this.setdir(playerNumber === 1 ? -this.speed : this.speed, this.speed);
  }

  setpos(x: number, y: number) {
    this._x = x;
    this._y = y;
    this._left = this._x - this.radius;
    // this.top = this._y - this.radius;
    this._right = this._x + this.radius;
    // this.bottom = this._y + this.radius;
  }

  setdir(dx: number, dy: number) {
    this.dxChanged = this._dx < 0 !== dx < 0; // did horizontal direction change
    this.dyChanged = this._dy < 0 !== dy < 0; // did vertical direction change
    this._dx = dx;
    this._dy = dy;
  }

  footprint() {
    if (this.showFootprints) {
      if (!this.footprintCount || this.dxChanged || this.dyChanged) {
        this.footprints.push({ x: this.x, y: this.y });
        if (this.footprints.length > 50) this.footprints.shift();
        this.footprintCount = 5;
      } else {
        this.footprintCount--;
      }
    }
  }

  intercept(
    rect: { right: number; left: number; top: number; bottom: number },
    nx: number,
    ny: number
  ) {
    let pt;
    // Moving left
    if (nx < 0) {
      pt = intercept({
        x1: this.x, // x coord on the right side of ball segment
        y1: this.y, // y coord on the right side of ball segment
        x2: this.x + nx, // x coord where ball will be painted moving left
        y2: this.y + ny, // y coord where the ball will be painted moving left
        x3: rect.right + this.radius,
        y3: rect.top - this.radius,
        x4: rect.right + this.radius,
        y4: rect.bottom + this.radius,
        d: 'right',
      });
    } else if (nx > 0) {
      pt = intercept({
        x1: this.x,
        y1: this.y,
        x2: this.x + nx,
        y2: this.y + ny,
        x3: rect.left - this.radius,
        y3: rect.top - this.radius,
        x4: rect.left - this.radius,
        y4: rect.bottom + this.radius,
        d: 'left',
      });
    }
    if (!pt) {
      if (ny < 0) {
        pt = intercept({
          x1: this.x,
          y1: this.y,
          x2: this.x + nx,
          y2: this.y + ny,
          x3: rect.left - this.radius,
          y3: rect.bottom + this.radius,
          x4: rect.right + this.radius,
          y4: rect.bottom + this.radius,
          d: 'bottom',
        });
      } else if (ny > 0) {
        pt = intercept({
          x1: this.x,
          y1: this.y,
          x2: this.x + nx,
          y2: this.y + ny,
          x3: rect.left - this.radius,
          y3: rect.top - this.radius,
          x4: rect.right + this.radius,
          y4: rect.top - this.radius,
          d: 'top',
        });
      }
    }
    return pt;
  }

  update(dt: number, leftPaddle: Paddle, rightPaddle: Paddle) {
    const pos = accelerate({
      x: this.x,
      y: this.y,
      dx: this.dx,
      dy: this.dy,
      accel: this.accel,
      dt,
    });

    // Reverse direction (up) if ball hits bottom wall
    if (pos.dy > 0 && pos.y > this.maxY) {
      pos.y = this.maxY; // Set the y position to the top of the bottom wal
      pos.dy = -pos.dy; // Reverse direction
      // Reverse direction (down) if ball hits top wall
    } else if (pos.dy < 0 && pos.y < this.minY) {
      pos.y = this.minY; // Set the y position to the bottom of the top wall
      pos.dy = -pos.dy; // Reverse direction
    }

    // Choose paddle based on direction of ball. Negative from right to left is left paddle
    const paddle = pos.dx < 0 ? leftPaddle : rightPaddle;
    // Test if the ball will intercept the current paddle
    const pt = this.intercept(paddle, pos.nx, pos.ny);
    // If there is an interception with a paddle set the position to the point of intercept
    // Switch directions based on left / right or top / bottom
    if (pt) {
      switch (pt.d) {
        case 'left':
        case 'right':
          pos.x = pt.x;
          pos.dx = -pos.dx;
          break;
        case 'top':
        case 'bottom':
          pos.y = pt.y;
          pos.dy = -pos.dy;
          break;
      }

      // add/remove spin based on paddle direction
      if (paddle.up) pos.dy = pos.dy * (pos.dy < 0 ? 0.5 : 1.5);
      else if (paddle.down) pos.dy = pos.dy * (pos.dy > 0 ? 0.5 : 1.5);
    }

    this.setpos(pos.x, pos.y);
    this.setdir(pos.dx, pos.dy);
    this.footprint();
  }

  draw(ctx: CanvasRenderingContext2D) {
    const side = this.radius * 2;
    ctx.fillStyle = Colors.ball;
    ctx.fillRect(this.x - this.radius, this.y - this.radius, side, side);
    if (this.showFootprints) {
      const max = this.footprints.length;
      ctx.strokeStyle = Colors.footprint;
      for (let n = 0; n < max; n++)
        ctx.strokeRect(
          this.footprints[n].x - this.radius,
          this.footprints[n].y - this.radius,
          side,
          side
        );
    }
  }
}
