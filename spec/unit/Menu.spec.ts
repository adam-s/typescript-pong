import 'jest-canvas-mock';
import { CanvasRenderingContext2DEvent } from 'jest-canvas-mock';
import { Menu } from '../../src/pong/Menu';

const mockImage = (width: number, height: number) => {
  Object.defineProperties(Image.prototype, {
    width: { value: width },
    height: { value: height },
    src: {
      set: (src: string) => {
        console.log('src', src);
      },
    },
  });
  const image = new Image();
  return image;
};

describe('Menu', () => {
  it('should exist', () => {
    expect(Menu).toBeDefined();
  });
  it('draw a menu', () => {
    const images = {
      'images/press1.png': mockImage(1, 1),
      'images/press2.png': mockImage(2, 2),
      'images/winner.png': mockImage(3, 3),
    };
    let events: CanvasRenderingContext2DEvent[];
    const implementation = new Menu({ images, width: 100, wallWidth: 100 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // No winner
    implementation.draw(ctx);
    events = ctx.__getEvents();
    expect(events).toMatchSnapshot();
    ctx.__clearEvents();

    // Player one is winner
    implementation.declareWinner(0);
    implementation.draw(ctx);
    events = ctx.__getEvents();
    expect(events).toMatchSnapshot();
    ctx.__clearEvents();

    // Player two is winner
    implementation.declareWinner(1);
    implementation.draw(ctx);
    events = ctx.__getEvents();
    expect(events).toMatchSnapshot();
    ctx.__clearEvents();
  });
});
