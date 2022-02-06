import { Drawable, ImageElement } from '../utils';
import { PlayerNumber } from './Pong';

interface MenuOptions {
  images: { [key: string]: HTMLImageElement };
  width: number;
  wallWidth: number;
}

export class Menu implements Drawable {
  private press1: ImageElement;

  private press2: ImageElement;

  private winner1: ImageElement;

  private winner2: ImageElement;

  private winner: PlayerNumber;

  constructor(options: MenuOptions) {
    const { images, width, wallWidth } = options;
    const press1 = images['press1'];
    const press2 = images['press2'];
    const winner = images['winner'];
    this.press1 = { image: press1, x: 10, y: wallWidth };
    this.press2 = {
      image: press2,
      x: width - press2.width - 10,
      y: wallWidth,
    };
    this.winner1 = {
      image: winner,
      x: width / 2 - winner.width - wallWidth,
      y: 6 * wallWidth,
    };
    this.winner2 = {
      image: winner,
      x: width / 2 + wallWidth,
      y: 6 * wallWidth,
    };
  }

  declareWinner(playerNumber: PlayerNumber) {
    this.winner = playerNumber;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Maybe wait for images to load
    ctx.drawImage(this.press1.image, this.press1.x, this.press1.y);
    ctx.drawImage(this.press2.image, this.press2.x, this.press2.y);
    if (this.winner == 0)
      ctx.drawImage(this.winner1.image, this.winner1.x, this.winner1.y);
    else if (this.winner == 1)
      ctx.drawImage(this.winner2.image, this.winner2.x, this.winner2.y);
  }
}
