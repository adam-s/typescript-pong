/* eslint-disable @typescript-eslint/no-empty-function */
import { Game } from '../engine/Engine';
import { Keys } from '../utils';
import { Ball } from './Ball';
import { Court } from './Court';
import { Menu } from './Menu';
import { Paddle } from './Paddle';
import { images, sounds } from './resources';

export type PlayerNumber = 0 | 1;

export type Scores = [number, number];

export type Level = { readonly aiReaction: number; readonly aiError: number };

export const Config = {
  width: 640, // logical canvas width (browser will scale to physical canvas size - which is controlled by @media css queries)
  height: 480, // logical canvas height (ditto)
  wallWidth: 12,
  paddleWidth: 12,
  paddleHeight: 60,
  paddleSpeed: 2, // should be able to cross court vertically   in 2 seconds
  ballSpeed: 4, // should be able to cross court horizontally in 4 seconds, at starting speed ...
  ballAccel: 8, // ... but accelerate as time passes
  ballRadius: 5,
  playSounds: true,
  showFootprints: false,
  showPredications: false,
} as const;

export const Colors = {
  walls: 'white',
  ball: 'white',
  score: 'white',
  footprint: '#333',
  predictionGuess: 'yellow',
  predictionExact: 'red',
} as const;

export const Levels = [
  { aiReaction: 0.2, aiError: 40 }, // 0:  ai is losing by 8
  { aiReaction: 0.3, aiError: 50 }, // 1:  ai is losing by 7
  { aiReaction: 0.4, aiError: 60 }, // 2:  ai is losing by 6
  { aiReaction: 0.5, aiError: 70 }, // 3:  ai is losing by 5
  { aiReaction: 0.6, aiError: 80 }, // 4:  ai is losing by 4
  { aiReaction: 0.7, aiError: 90 }, // 5:  ai is losing by 3
  { aiReaction: 0.8, aiError: 100 }, // 6:  ai is losing by 2
  { aiReaction: 0.9, aiError: 110 }, // 7:  ai is losing by 1
  { aiReaction: 1.0, aiError: 120 }, // 8:  tie
  { aiReaction: 1.1, aiError: 130 }, // 9:  ai is winning by 1
  { aiReaction: 1.2, aiError: 140 }, // 10: ai is winning by 2
  { aiReaction: 1.3, aiError: 150 }, // 11: ai is winning by 3
  { aiReaction: 1.4, aiError: 160 }, // 12: ai is winning by 4
  { aiReaction: 1.5, aiError: 170 }, // 13: ai is winning by 5
  { aiReaction: 1.6, aiError: 180 }, // 14: ai is winning by 6
  { aiReaction: 1.7, aiError: 190 }, // 15: ai is winning by 7
  { aiReaction: 1.8, aiError: 200 }, // 16: ai is winning by 8
] as const;

export class Pong implements Game {
  public readonly width = Config.width;

  public readonly height = Config.height;

  private _scores: Scores = [0, 0];

  private _playing = false;

  private _menu: Menu;

  private _court: Court;

  private _leftPaddle: Paddle;

  private _rightPaddle: Paddle;

  private _ball: Ball;

  private _images: { [key: string]: HTMLImageElement } = {};

  private _playSounds = false;

  constructor() {
    this._playSounds = Config.playSounds;

    const paddleOptions = {
      paddleWidth: Config.paddleWidth,
      paddleHeight: Config.paddleHeight,
      paddleSpeed: Config.paddleSpeed,
      wallWidth: Config.wallWidth,
      height: Config.height,
      width: Config.width,
      showPredictions: Config.showPredications,
    };
    this._leftPaddle = new Paddle(
      Object.assign({}, paddleOptions, {
        rightHandSide: false,
      })
    );
    this._rightPaddle = new Paddle(
      Object.assign({}, paddleOptions, {
        rightHandSide: true,
      })
    );
    this._ball = new Ball({
      ballRadius: Config.ballRadius,
      width: Config.width,
      height: Config.height,
      wallWidth: Config.wallWidth,
      ballSpeed: Config.ballSpeed,
      ballAccel: Config.ballAccel,
      footprints: Config.showFootprints,
    });

    this._court = new Court({
      width: Config.width,
      height: Config.height,
      wallWidth: Config.wallWidth,
    });

    // The menu requires loading images first so this has to be called in
    // an async init() method 😡 I'm and idiot.
    const promises = Object.values(images).map((image) => image.ready);
    Promise.all(promises).then(() => {
      for (const image in images) {
        this._images[image] = images[image as keyof typeof images].image;
      }
      this._menu = new Menu({
        images: this._images,
        width: Config.width,
        wallWidth: Config.wallWidth,
      });
    });
  }

  startDemo() {
    this.start(0);
  }
  startSinglePlayer() {
    this.start(1);
  }
  startDoublePlayer() {
    this.start(2);
  }

  start(numPlayers: 0 | 1 | 2) {
    if (!this._playing) {
      this._scores = [0, 0];
      this._playing = true;
      this._leftPaddle.setAuto(numPlayers < 1, this.level(0));
      this._rightPaddle.setAuto(numPlayers < 2, this.level(1));
      this._ball.reset(null);
      // this._runner.hideCursor();
    }
  }

  stop(ask?: boolean): void {
    ask;
    if (this._playing) {
      // if (!ask || this.runner.confirm('Abandon game in progress ?')) {
      this._playing = false;
      this._leftPaddle.setAuto(false);
      this._rightPaddle.setAuto(false);
      // this.runner.showCursor();
      // }
    }
  }

  level(playerNumber: PlayerNumber): number {
    return (
      8 + (this._scores[playerNumber] - this._scores[playerNumber ? 0 : 1])
    );
  }

  sounds(sound: keyof typeof sounds) {
    if (this._playSounds) {
      switch (sound) {
        case 'goal':
          sounds.goal.play();
          break;
        case 'ping':
          sounds.ping.play();
          break;
        case 'pong':
          sounds.pong.play();
          break;
        case 'wall':
          sounds.wall.play();
          break;
      }
    }
  }

  goal(playerNumber: PlayerNumber) {
    this.sounds('goal');
    this._scores[playerNumber] += 1;
    if (this._scores[playerNumber] == 9) {
      this._menu.declareWinner(playerNumber);
      this.stop();
    } else {
      this._ball.reset(playerNumber);
      this._leftPaddle.setLevel(this.level(0));
      this._rightPaddle.setLevel(this.level(1));
    }
  }

  update(dt: number): void {
    this._leftPaddle.update(dt, this._ball);
    this._rightPaddle.update(dt, this._ball);
    if (this._playing) {
      // Get the previous position
      const dx = this._ball.dx;
      const dy = this._ball.dy;

      // Update the position
      this._ball.update(dt, this._leftPaddle, this._rightPaddle);

      // Sounds based on difference between previous and current updated positions
      if (this._ball.dx < 0 && dx > 0) {
        this.sounds('ping');
      } else if (this._ball.dx > 0 && dx < 0) {
        this.sounds('pong');
      } else if (this._ball.dy * dy < 0) {
        this.sounds('wall');
      }

      if (this._ball.left > this.width) this.goal(0);
      else if (this._ball.right < 0) this.goal(1);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this._court.draw(ctx, this._scores[0], this._scores[1]);
    this._leftPaddle.draw(ctx);
    this._rightPaddle.draw(ctx);
    if (this._playing) this._ball.draw(ctx);
    else this._menu.draw(ctx);
  }

  onkeydown(ev: KeyboardEvent) {
    switch (ev.code) {
      case Keys.Key0:
        this.startDemo();
        break;
      case Keys.Key1:
        this.startSinglePlayer();
        break;
      case Keys.Key2:
        this.startDoublePlayer();
        break;
      case Keys.Escape:
        this.stop(true);
        break;
      case Keys.Q:
        if (!this._leftPaddle.auto) this._leftPaddle.moveUp();
        break;
      case Keys.A:
        if (!this._leftPaddle.auto) this._leftPaddle.moveDown();
        break;
      case Keys.P:
        if (!this._rightPaddle.auto) this._rightPaddle.moveUp();
        break;
      case Keys.L:
        if (!this._rightPaddle.auto) this._rightPaddle.moveDown();
        break;
    }
  }

  onkeyup(ev: KeyboardEvent) {
    switch (ev.code) {
      case Keys.Q:
        if (!this._leftPaddle.auto) this._leftPaddle.stopMovingUp();
        break;
      case Keys.A:
        if (!this._leftPaddle.auto) this._leftPaddle.stopMovingDown();
        break;
      case Keys.P:
        if (!this._rightPaddle.auto) this._rightPaddle.stopMovingUp();
        break;
      case Keys.L:
        if (!this._rightPaddle.auto) this._rightPaddle.stopMovingDown();
        break;
    }
  }

  showFootprints(show: boolean) {
    // Have to toggle showFootprints on ball
    this._ball.showFootprints = show;
  }

  showPredictions(show: boolean) {
    // Have to toggle showPredications on the paddle
    this._leftPaddle.showPredications = show;
    this._rightPaddle.showPredications = show;
  }

  playSounds(enabled: boolean) {
    // Have to toggle enableSound on this (pong)
    this._playSounds = enabled;
  }
}
