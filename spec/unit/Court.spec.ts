import 'jest-canvas-mock';
import { Court } from '../../src/pong';

describe('Court', () => {
  let implementation: Court;

  beforeEach(() => {
    implementation = new Court({ width: 1, height: 1, wallWidth: 1 });
  });

  it('should exist', () => {
    expect(Court).toBeDefined();
  });

  it('can be created', () => {
    expect(implementation).toBeDefined();
    expect(implementation['walls']).toEqual([
      { x: 0, y: 0, width: 1, height: 1 },
      { x: 0, y: 0, width: 1, height: 1 },
      { x: 0, y: 0.5, width: 1, height: 1 },
    ]);
    expect(implementation['wallWidth']).toEqual(1);
    expect(implementation['score1']).toEqual({
      x: -3.5,
      y: 2,
      width: 3,
      height: 4,
    });
    expect(implementation['score2']).toEqual({
      x: 2.5,
      y: 2,
      width: 3,
      height: 4,
    });
  });

  describe('renders the court to canvas', () => {
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
      const canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
    });

    afterEach(() => {
      ctx.__clearEvents();
    });

    it('draws', () => {
      // https://stackoverflow.com/questions/50091438/jest-how-to-mock-one-specific-method-of-a-class
      jest
        .spyOn(implementation, 'drawDigit')
        .mockImplementation(() => undefined);
      implementation.draw(ctx, 0, 0);
      expect(implementation.drawDigit).toHaveBeenCalledTimes(2);
      const events = ctx.__getEvents();
      // jest will assert the events match the snapshot
      expect(events).toMatchSnapshot();
    });

    it('draws a digit', () => {
      const score = { x: 1, y: 1, width: 1, height: 1 };
      implementation.drawDigit(ctx, 1, score);
      const events = ctx.__getEvents();
      expect(events).toMatchSnapshot();
    });
  });
});
