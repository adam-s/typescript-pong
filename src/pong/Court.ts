import { Drawable, BlockElement } from '../utils';
import { Colors } from './Pong';

interface CourtOptions {
  width: number;
  height: number;
  wallWidth: number;
}

const DIGITS = [
  [1, 1, 1, 0, 1, 1, 1], // 0
  [0, 0, 1, 0, 0, 1, 0], // 1
  [1, 0, 1, 1, 1, 0, 1], // 2
  [1, 0, 1, 1, 0, 1, 1], // 3
  [0, 1, 1, 1, 0, 1, 0], // 4
  [1, 1, 0, 1, 0, 1, 1], // 5
  [1, 1, 0, 1, 1, 1, 1], // 6
  [1, 0, 1, 0, 0, 1, 0], // 7
  [1, 1, 1, 1, 1, 1, 1], // 8
  [1, 1, 1, 1, 0, 1, 0], // 9
] as const;

export class Court implements Drawable {
  private wallWidth: number;

  private walls: BlockElement[] = [];

  private score1: BlockElement;

  private score2: BlockElement;

  constructor(options: CourtOptions) {
    const { width, height, wallWidth } = options;
    this.wallWidth = wallWidth;

    // Top wall
    this.walls.push({ x: 0, y: 0, width, height: wallWidth });

    // Bottom wall
    this.walls.push({ x: 0, y: height - wallWidth, width, height: wallWidth });

    // Draw vertical dashed line halfway
    const innerHeight = height / (wallWidth * 2);
    for (let n = 0; n < innerHeight; n++) {
      this.walls.push({
        x: width / 2 - wallWidth / 2,
        y: wallWidth / 2 + wallWidth * 2 * n,
        width: wallWidth,
        height: wallWidth,
      });
    }

    const scoreWidth = 3 * wallWidth;
    const scoreHeight = 4 * wallWidth;

    this.score1 = {
      x: 0.5 + width / 2 - 1.5 * wallWidth - scoreWidth,
      y: 2 * wallWidth,
      width: scoreWidth,
      height: scoreHeight,
    };

    this.score2 = {
      x: 0.5 + width / 2 + 1.5 * wallWidth,
      y: 2 * wallWidth,
      width: scoreWidth,
      height: scoreHeight,
    };
  }

  draw(
    ctx: CanvasRenderingContext2D,
    scorePlayer1: number,
    scorePlayer2: number
  ) {
    ctx.fillStyle = Colors.walls;
    for (let i = 0; i < this.walls.length; i++) {
      const { x, y, width, height } = this.walls[i];
      ctx.fillRect(x, y, width, height);
    }

    this.drawDigit(ctx, scorePlayer1, this.score1);
    this.drawDigit(ctx, scorePlayer2, this.score2);
  }

  drawDigit(
    ctx: CanvasRenderingContext2D,
    score: number,
    scoreElement: BlockElement
  ) {
    const { x, y, width, height } = scoreElement;
    ctx.fillStyle = Colors.walls;

    const drawWidth = (this.wallWidth * 4) / 5;
    const drawHeight = drawWidth; // For self documentation

    const blocks = DIGITS[score];

    if (blocks[0]) {
      ctx.fillRect(x, y, width, drawWidth);
    }
    if (blocks[1]) {
      ctx.fillRect(x, y, drawWidth, height / 2);
    }
    if (blocks[2]) {
      ctx.fillRect(x + width - drawWidth, y, drawWidth, height / 2);
    }
    if (blocks[3]) {
      ctx.fillRect(x, y + height / 2 - drawHeight / 2, width, drawHeight);
    }
    if (blocks[4]) {
      ctx.fillRect(x, y + height / 2, drawWidth, height / 2);
    }
    if (blocks[5]) {
      ctx.fillRect(
        x + width - drawWidth,
        y + height / 2,
        drawWidth,
        height / 2
      );
    }
    if (blocks[6]) {
      ctx.fillRect(x, y + height - drawHeight, width, drawHeight);
    }
  }
}
