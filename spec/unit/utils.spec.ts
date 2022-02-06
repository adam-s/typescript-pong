import { Direction, intercept, accelerate } from '../../src/utils';

/**
 * https://codeincomplete.com/articles/javascript-pong/part4/
 * https://www.topcoder.com/thrive/articles/Geometry%20Concepts%20part%201:%20Basic%20Concepts
 * https://web.archive.org/web/20120311193422/http://paulbourke.net/geometry/lineline2d/
 * https://www.youtube.com/watch?v=c065KoXooSw
 *
 * Direction gets passed through ???
 */
describe('intersects', () => {
  // 1) segment (0, 0) and (3,3) and segment (0, 3) and (3, 0) cross
  it('crosses', () => {
    const params = {
      x1: 0,
      y1: 0,
      x2: 3,
      y2: 3,
      x3: 0,
      y3: 3,
      x4: 3,
      y4: 0,
      d: 'left' as Direction,
    };

    const pt = intercept(params);
    expect(pt).toEqual({ x: 1.5, y: 1.5, d: 'left' });
  });

  // 2) segment (0, 0) and (3,3) and segment (3, 0) and (6, 3) parallel
  it("doesn't cross", () => {
    const params = {
      x1: 0,
      y1: 0,
      x2: 3,
      y2: 3,
      x3: 3,
      y3: 0,
      x4: 6,
      y4: 3,
      d: 'left' as Direction,
    };

    const pt = intercept(params);
    expect(pt).toBeNull();
  });

  // 3) segment (0, 0) and (3,3) and segment (1, 1) and (4, 4) cross and parallel, coincident
  it('coincident', () => {
    const params = {
      x1: 0,
      y1: 0,
      x2: 3,
      y2: 3,
      x3: 1,
      y3: 1,
      x4: 4,
      y4: 4,
      d: 'left' as Direction,
    };

    const pt = intercept(params);
    expect(pt).toBeNull();
  });
});

/**
 * http://zonalandeducation.com/mstm/physics/mechanics/kinematics/EquationsForAcceleratedMotion/EquationsForAcceleratedMotion.htm
 */
describe('accelerate', () => {
  const params = {
    x: 1,
    y: 1,
    dx: 1,
    dy: 1,
    accel: 1,
    dt: 1,
  };

  const pos = accelerate(params);
  expect(pos).toEqual({ nx: 1.5, ny: 1.5, x: 2.5, y: 2.5, dx: 2, dy: 2 });
});
