import 'jest-canvas-mock';
import { CanvasRenderingContext2DEvent } from 'jest-canvas-mock';
import { ImageSource } from '../../src/Loader';
import { Menu } from '../../src/pong/Menu';

jest.mock('../../src/loader/ImageSource');

describe('Menu', () => {
  it('should exist', () => {
    expect(Menu).toBeDefined();
  });
  it('draw a menu', (done) => {
    const images = {
      press1: new ImageSource('images/press1.png'),
      press2: new ImageSource('images/press2.png'),
      winner: new ImageSource('images/winner.png'),
    };
    let events: CanvasRenderingContext2DEvent[];
    const implementation = new Menu({ images, width: 100, wallWidth: 100 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Run the tests after the promise in the constructor resolves putting them to the back of the callback queue
    setTimeout(() => {
      console.log(implementation);
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

      done();
    }, 0);
  });
});
