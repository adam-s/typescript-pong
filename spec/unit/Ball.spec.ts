/* eslint-disable @typescript-eslint/no-var-requires */
import 'jest-canvas-mock';
import { Ball } from '../../src/pong/Ball';
import { Engine } from '../../src/engine/Engine';
import * as utils from '../../src/utils/utils';
import { Paddle } from '../../src/pong/Paddle';
jest.mock('../../src/engine/Engine');

describe('Ball', () => {
  it('should exist', () => {
    expect(Ball).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('instance', () => {
    let implementation: Ball;
    const Config = require('../../src/pong/Pong').Config;

    beforeEach(() => {
      implementation = new Ball(Config);
    });

    it('instantiates a ball', () => {
      expect(implementation).toMatchSnapshot();
    });

    it('resets', () => {
      // https://stackoverflow.com/questions/50421732/mocking-up-static-methods-in-jest
      Engine.random = jest.fn().mockReturnValue(1);
      implementation.setdir = jest.fn();
      implementation.setpos = jest.fn();
      implementation.reset(1);
      expect(implementation['footprints']).toEqual([]);
      expect(implementation.setdir).toBeCalledWith(-157.5, 157.5);
      expect(implementation.setpos).toBeCalledWith(635, 1);
    });

    it('setpos', () => {
      implementation.setpos(10, 10);
      expect(implementation).toMatchSnapshot();
    });

    it('setdir', () => {
      implementation.setdir(-191, 1);
      expect(implementation).toMatchSnapshot();
    });
  });

  describe('footprints', () => {
    jest.mock('../../src/pong/Pong', () => {
      const originalModule = jest.requireActual('../../src/pong/Pong');
      return {
        __esModule: true,
        ...originalModule,
        Config: {
          ...originalModule.Config,
          footprints: true,
        },
      };
    });

    const Config = require('../../src/pong/Pong').Config;
    let ball: Ball;
    beforeEach(() => {
      ball = new Ball(Config);
    });

    it('should create footprints', () => {
      ball.footprint();
      expect(ball['footprints']).toEqual([{ x: 0, y: 0 }]);
    });

    it('should decrement footprintCount by 1', () => {
      ball.footprint();
      expect(ball['footprintCount']).toBe(5);
      ball.footprint();
      expect(ball['footprintCount']).toBe(4);
      ball.footprint();
      expect(ball['footprintCount']).toBe(3);
      ball.footprint();
      expect(ball['footprintCount']).toBe(2);
      ball.footprint();
      expect(ball['footprintCount']).toBe(1);
      ball.footprint();
      expect(ball['footprintCount']).toBe(0);
      ball.footprint();
      expect(ball['footprintCount']).toBe(5);
    });
  });
  // Intercept
  describe('intercept', () => {
    let implementation: Ball;
    const Config = require('../../src/pong/Pong').Config;

    beforeEach(() => {
      implementation = new Ball(Config);
    });

    /**
     * x1 621.0463999999953
     * y1 42.18688000000225
     * x2 624.0263039999953
     * y2 39.20902400000228
     * x3 623
     * y3 10.168
     * x4 623
     * y4 80.168
     * d left
     * ball.x 621.0463999999953
     * ball.y 42.18688000000225
     * nx 2.979904000000033
     * ny -2.977855999999967
     * rect.top 15.168
     * rect.left 628
     * rect.bottom 75.168
     * ball.radius 5
     * d: "left"
     * x: 623
     * y: 40.234622651572934
     */
    it('call intercept with left', () => {
      const interceptSpy = jest.spyOn(utils, 'intercept').mockReturnValue({
        d: 'left',
        x: 623,
        y: 40.234622651572934,
      });
      const rect = { right: 100, left: 628, top: 15.168, bottom: 75.168 };
      const nx = 2.979904000000033;
      const ny = -2.977855999999967;
      implementation['_x'] = 621.0463999999953;
      implementation['_y'] = 42.18688000000225;
      implementation.intercept(rect, nx, ny);
      expect(interceptSpy.mock.calls[0][0]).toEqual({
        x1: 621.0463999999953,
        y1: 42.18688000000225,
        x2: 624.0263039999953,
        y2: 39.20902400000228,
        x3: 623,
        y3: 10.168,
        x4: 623,
        y4: 80.168,
        d: 'left',
      });
      interceptSpy.mockClear();
    });
    /**
     * x1 19.626584000007547
     * y1 329.49776800000086
     * x2 16.257304000007604
     * y2 326.1284880000009
     * x3 17
     * y3 309.34600000000023
     * x4 17
     * y4 379.34600000000023
     * d right
     * ball.x 19.626584000007547
     * ball.y 329.49776800000086
     * nx -3.369279999999943
     * ny -3.3692799999999465
     * rect.right 12
     * rect.top 314.34600000000023
     * rect.bottom 374.34600000000023
     * ball.radius 5
     * pt {x: 17, y: 326.8711839999933, d: 'right'}
     */
    it('call intercept with right', () => {
      const interceptSpy = jest
        .spyOn(utils, 'intercept')
        .mockReturnValue({ x: 17, y: 326.8711839999933, d: 'right' });
      const rect = {
        right: 12,
        left: 0,
        top: 314.34600000000023,
        bottom: 374.34600000000023,
      };
      const nx = -3.369279999999943;
      const ny = -3.369279999999943;
      implementation['_x'] = 19.626584000007547;
      implementation['_y'] = 329.49776800000086;
      implementation.intercept(rect, nx, ny);
      expect(interceptSpy.mock.calls[0][0]).toEqual({
        x1: 19.626584000007547,
        y1: 329.49776800000086,
        x2: 16.257304000007604,
        y2: 326.1284880000009,
        x3: 17,
        y3: 309.34600000000023,
        x4: 17,
        y4: 379.34600000000023,
        d: 'right',
      });
      interceptSpy.mockClear();
    });
    /**
     *  x1 620.5650559999834
     *  y1 17
     *  x2 624.6336559999834
     *  y2 22.964209999999852
     *  x3 623
     *  y3 22.444000000000017
     *  x4 645
     *  y4 22.444000000000017
     *  d top
     *  ball.x 620.5650559999834
     *  ball.y 17
     *  nx 4.068599999999947
     *  ny 5.964209999999852
     *  rect.left 628
     *  rect.top 27.444000000000017
     *  rect.right 640
     *  ball.radius 5
     *  pt {x: 624.2787847922292, y: 22.444000000000017, d: 'top'}
     */
    it('call intercept with top', () => {
      const interceptSpy = jest
        .spyOn(utils, 'intercept')
        .mockReturnValueOnce(null)
        .mockReturnValue({
          x: 624.2787847922292,
          y: 22.444000000000017,
          d: 'top',
        });
      const rect = {
        left: 628,
        top: 27.444000000000017,
        right: 640,
        bottom: 0,
      };
      const nx = 4.068599999999947;
      const ny = 5.964209999999852;
      implementation['_x'] = 620.5650559999834;
      implementation['_y'] = 17;
      implementation.intercept(rect, nx, ny);
      expect(interceptSpy.mock.calls[1][0]).toEqual({
        x1: 620.5650559999834,
        y1: 17,
        x2: 624.6336559999834,
        y2: 22.964209999999852,
        x3: 623,
        y3: 22.444000000000017,
        x4: 645,
        y4: 22.444000000000017,
        d: 'top',
      });
      interceptSpy.mockClear();
    });
    /**
     *  x1 620.9805519999878
     *  y1 463
     *  x2 626.3485519999878
     *  y2 455.06838400000015
     *  x3 623
     *  y3 455.7740000000003
     *  x4 645
     *  y4 455.7740000000003
     *  d bottom
     *  ball.x 620.9805519999878
     *  ball.y 463
     *  nx 5.367999999999938
     *  ny -7.931615999999849
     *  rect.left 628
     *  rect.bottom 450.7740000000003
     *  rect.right 640
     *  ball.radius 5
     *  pt {x: 625.871001562851, y: 455.7740000000003, d: 'bottom'}
     */
    it('call intercept with bottom', () => {
      const interceptSpy = jest
        .spyOn(utils, 'intercept')
        .mockReturnValueOnce(null)
        .mockReturnValue({
          x: 625.871001562851,
          y: 455.7740000000003,
          d: 'bottom',
        });
      const rect = {
        left: 628,
        bottom: 450.7740000000003,
        right: 640,
        top: 0,
      };
      const nx = 5.367999999999938;
      const ny = -7.931615999999849;
      implementation['_x'] = 620.9805519999878;
      implementation['_y'] = 463;
      implementation.intercept(rect, nx, ny);
      expect(interceptSpy.mock.calls[1][0]).toEqual({
        x1: 620.9805519999878,
        y1: 463,
        x2: 626.3485519999878,
        y2: 455.06838400000015,
        x3: 623,
        y3: 455.7740000000003,
        x4: 645,
        y4: 455.7740000000003,
        d: 'bottom',
      });
      interceptSpy.mockClear();
    });
  });
  describe('update', () => {
    const Config = require('../../src/pong/Pong').Config;

    let implementation: Ball;
    let setposSpy: jest.SpyInstance;
    let setdirSpy: jest.SpyInstance;
    let footprintSpy: jest.SpyInstance;
    let interceptSpy: jest.SpyInstance;

    const accelerateSpy = jest.spyOn(utils, 'accelerate');

    let leftPaddle: Paddle;
    let rightPaddle: Paddle;

    beforeEach(() => {
      implementation = new Ball(Config);
      setposSpy = jest
        .spyOn(implementation, 'setpos')
        .mockImplementation(() => undefined);
      setdirSpy = jest
        .spyOn(implementation, 'setdir')
        .mockImplementation(() => undefined);
      footprintSpy = jest
        .spyOn(implementation, 'footprint')
        .mockImplementation(() => undefined);
      interceptSpy = jest
        .spyOn(implementation, 'intercept')
        .mockImplementation(() => undefined);

      leftPaddle = new Paddle(Config);
      rightPaddle = new Paddle(Config);
      jest.clearAllMocks();
    });

    it('hits bottom wall then changes direction up', () => {
      accelerateSpy.mockImplementation(() => ({
        dx: 168.13199999999938,
        dy: 168.13199999999938,
        nx: 2.8570880000000045,
        ny: 2.857087999999976,
        x: 221.38246399999957,
        y: 465.7664818886045,
      }));
      implementation.update(0, leftPaddle, rightPaddle);
      expect(setposSpy).toBeCalledWith(221.38246399999957, 463);
      expect(setdirSpy).toBeCalledWith(168.13199999999938, -168.13199999999938);
      expect(footprintSpy).toBeCalled();
    });

    it('hits top wall then changes direction down', () => {
      accelerateSpy.mockImplementation(() => ({
        dx: -189.68399999999804,
        dy: -189.68399999999804,
        nx: -3.0318719999999075,
        ny: -3.0318719999999697,
        x: 544.4649520000016,
        y: 14.450568000001619,
      }));
      implementation.update(0, leftPaddle, rightPaddle);
      expect(setposSpy).toBeCalledWith(544.4649520000016, 17);
      expect(setdirSpy).toBeCalledWith(-189.68399999999804, 189.68399999999804);
      expect(footprintSpy).toBeCalled();
    });

    it('hits left / right paddle then changes direction', () => {
      accelerateSpy.mockImplementation(() => ({
        dx: 186.2839999999989,
        dy: -186.2839999999989,
        nx: 3.3518159999999853,
        ny: -3.3492239999999818,
        x: 623.4674159999983,
        y: 27.49023200000089,
      }));
      interceptSpy.mockImplementation(() => ({
        d: 'left',
        x: 623,
        y: 27.95728654153245,
      }));
      implementation.update(0, leftPaddle, rightPaddle);
      expect(setposSpy).toBeCalledWith(623, 27.49023200000089);
      expect(setdirSpy).toBeCalledWith(-186.2839999999989, -186.2839999999989);
      expect(footprintSpy).toBeCalled();
    });

    it('hits top / bottom paddle then changes direction', () => {
      accelerateSpy.mockImplementation(() => ({
        dx: 363.5799999999966,
        dy: -312.63499999999544,
        nx: 5.452799999999911,
        ny: -4.686824999999942,
        x: 633.6720559999937,
        y: 178.57399999999942,
      }));
      interceptSpy.mockImplementation(() => ({
        x: 631.2019512412338,
        y: 178.57399999999942,
        d: 'bottom',
      }));
      implementation.update(0, leftPaddle, rightPaddle);
      expect(setposSpy).toBeCalledWith(633.6720559999937, 178.57399999999942);
      expect(setdirSpy).toBeCalledWith(363.5799999999966, 312.63499999999544);
      expect(footprintSpy).toBeCalled();
    });

    it('puts spin on the ball when paddle moves down', () => {
      accelerateSpy.mockImplementation(() => ({
        dx: 210.74799999999772,
        dy: -210.74799999999772,
        nx: 3.5815599999999677,
        ny: -3.579248000000007,
        x: 623.8756399999951,
        y: 452.47927200000004,
      }));
      interceptSpy.mockImplementation(() => ({
        x: 623,
        y: 453.3543467491882,
        d: 'left',
      }));
      rightPaddle['_down'] = 1;
      implementation.update(0, leftPaddle, rightPaddle);
      expect(setposSpy).toBeCalledWith(623, 452.47927200000004);
      expect(setdirSpy).toBeCalledWith(
        -210.74799999999772,
        -316.12199999999655
      );
      expect(footprintSpy).toBeCalled();
    });
  });
  describe('draw', () => {
    let ctx: CanvasRenderingContext2D;
    const Config = require('../../src/pong/Pong').Config;
    let implementation: Ball;

    const canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    beforeEach(() => {
      const canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      implementation = new Ball(Config);
    });

    afterEach(() => {
      ctx.__clearEvents();
    });

    it('renders ball to canvas', () => {
      implementation.draw(ctx);
      const events = ctx.__getEvents();
      expect(events).toMatchSnapshot();
    });

    it('renders footprints to canvas', () => {
      const footprints = [
        { x: 258.9049039999994, y: 303.8599039999993 },
        { x: 275.25293599999924, y: 287.52415999999914 },
        { x: 291.674695999999, y: 271.1147039999991 },
        { x: 308.5146239999988, y: 254.2875919999991 },
        { x: 324.73939999999857, y: 238.07462399999923 },
        { x: 341.38234399999834, y: 221.44396799999933 },
        { x: 357.9245039999982, y: 204.91386399999945 },
        { x: 374.88941599999794, y: 187.9615519999996 },
        { x: 391.75354399999776, y: 171.10975999999977 },
        { x: 408.69139999999754, y: 154.1842079999999 },
      ];
      implementation['footprints'] = footprints;
      implementation['showFootprints'] = true;
      implementation.draw(ctx);
      const events = ctx.__getEvents();
      expect(events).toMatchSnapshot();
    });
  });
});
