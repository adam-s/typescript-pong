import 'jest-canvas-mock';
import { Pong, Ball, Court, Menu, Paddle } from '../../src/pong';

jest.mock('../../src/pong/Ball');
jest.mock('../../src/pong/Court');
jest.mock('../../src/pong/Menu');
jest.mock('../../src/pong/Paddle');

describe('Pong', function () {
  it('should exist', function () {
    expect(Pong).toBeDefined;
  });

  let implementation: Pong;
  beforeEach(() => {
    jest.mock('../../src/pong/resources.ts', () => {
      return {
        loader: jest.fn(),
        images: {
          press1: { image: new Image() },
          press2: { image: new Image() },
          winner: { image: new Image() },
        },
      };
    });
    implementation = new Pong();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an instance', () => {
    expect(implementation).toBeDefined();
    expect(Ball).toHaveBeenCalled();
    expect(Court).toHaveBeenCalled();
    expect(Menu).toHaveBeenCalled();
    expect(Paddle).toHaveBeenCalledTimes(2);
  });

  it('starts with 0', () => {
    implementation.start(0);
    expect((Paddle as jest.Mock).mock.instances[0].setAuto).toBeCalledWith(
      true,
      8
    );
    expect((Paddle as jest.Mock).mock.instances[1].setAuto).toBeCalledWith(
      true,
      8
    );
  });

  it('starts with 1', () => {
    implementation.start(1);
    expect((Paddle as jest.Mock).mock.instances[0].setAuto).toBeCalledWith(
      false,
      8
    );
    expect((Paddle as jest.Mock).mock.instances[1].setAuto).toBeCalledWith(
      true,
      8
    );
  });

  it('starts with 2', () => {
    implementation.start(2);
    expect((Paddle as jest.Mock).mock.instances[0].setAuto).toBeCalledWith(
      false,
      8
    );
    expect((Paddle as jest.Mock).mock.instances[1].setAuto).toBeCalledWith(
      false,
      8
    );
  });

  it('stopping does nothing if not playing', () => {
    implementation['_playing'] = false;
    implementation.stop();
    expect((Paddle as jest.Mock).mock.instances[0].setAuto).not.toBeCalled();
    expect((Paddle as jest.Mock).mock.instances[1].setAuto).not.toBeCalled();
  });

  it('stops game', () => {
    implementation['_playing'] = true;
    implementation.stop();
    expect((Paddle as jest.Mock).mock.instances[0].setAuto).toBeCalledWith(
      false
    );
    expect((Paddle as jest.Mock).mock.instances[1].setAuto).toBeCalledWith(
      false
    );
  });

  it('sets the level correctly', () => {
    implementation['_scores'] = [0, 0];
    let level = implementation.level(0);
    expect(level).toBe(8);
    implementation['_scores'] = [7, 2];
    level = implementation.level(1);
    expect(level).toBe(3);
  });

  it('goaaaaaaals', () => {
    const stopSpy = jest.spyOn(implementation, 'stop');
    implementation.goal(0);
    expect((Paddle as jest.Mock).mock.instances[0].setLevel).toBeCalledWith(9);
    expect((Paddle as jest.Mock).mock.instances[1].setLevel).toBeCalledWith(7);
    expect((Ball as jest.Mock).mock.instances[0].reset).toBeCalledWith(0);
    expect(
      (Menu as jest.Mock).mock.instances[0].declareWinner
    ).not.toBeCalled();
    expect(stopSpy).not.toBeCalled();
  });

  it('goals and declares a winner', () => {
    const stopSpy = jest.spyOn(implementation, 'stop');
    implementation['_scores'] = [8, 8];
    implementation.goal(0);
    expect((Paddle as jest.Mock).mock.instances[0].setLevel).not.toBeCalled();
    expect((Paddle as jest.Mock).mock.instances[1].setLevel).not.toBeCalled();
    expect((Ball as jest.Mock).mock.instances[0].reset).not.toBeCalled();
    expect((Menu as jest.Mock).mock.instances[0].declareWinner).toBeCalledWith(
      0
    );
    expect(stopSpy).toBeCalled();
  });

  it('updates paddle when not playing', () => {
    implementation['_playing'] = false;
    implementation.update(0);
    expect((Paddle as jest.Mock).mock.instances[0].update).toBeCalledWith(
      0,
      implementation['_ball']
    );
    expect((Paddle as jest.Mock).mock.instances[1].update).toBeCalledWith(
      0,
      implementation['_ball']
    );
  });

  it('updates ball when playing', () => {
    implementation['_playing'] = true;
    implementation.update(0);
    expect((Ball as jest.Mock).mock.instances[0].update).toBeCalledWith(
      0,
      (Paddle as jest.Mock).mock.instances[0],
      (Paddle as jest.Mock).mock.instances[1]
    );
  });

  it('updates player 0 goal if ball left side passes court width', () => {
    const goalSpy = jest.spyOn(implementation, 'goal');
    implementation['_playing'] = true;
    // https://stackoverflow.com/a/41803821/494664
    // Use Object.defineProperty to change instances created by the consumer class
    // The values are destroyed if the consumer is recreated before each test case
    Object.defineProperty(implementation['_ball'], 'left', {
      get: () => 641,
    });
    implementation.update(0);
    expect(goalSpy).toBeCalledWith(0);
  });

  it('updates player 1 goal if ball right side is less than court start', () => {
    const goalSpy = jest.spyOn(implementation, 'goal');
    implementation['_playing'] = true;
    Object.defineProperty(implementation['_ball'], 'right', {
      get: () => -1,
    });
    implementation.update(0);
    expect(goalSpy).toBeCalledWith(1);
  });

  it('renders to canvas not playing', () => {
    implementation['_playing'] = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    implementation.draw(ctx);
    const events = ctx.__getEvents();
    expect(events).toMatchSnapshot();
    ctx.__clearEvents();
  });

  it('renders to canvas when playing', () => {
    implementation['_playing'] = true;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    implementation.draw(ctx);
    const events = ctx.__getEvents();
    expect(events).toMatchSnapshot();
    ctx.__clearEvents();
  });

  describe('keydown events', () => {
    it('Digit0 starts auto play', () => {
      const spy = jest
        .spyOn(implementation, 'startDemo')
        .mockImplementation(() => undefined);
      const event = new KeyboardEvent('keydown', { key: 'Digit0' });
      implementation.onkeydown(event);
      expect(spy).toBeCalled();
    });

    it('Digit1 starts single player game', () => {
      const spy = jest
        .spyOn(implementation, 'startSinglePlayer')
        .mockImplementation(() => undefined);
      const event = new KeyboardEvent('keydown', { key: 'Digit1' });
      implementation.onkeydown(event);
      expect(spy).toBeCalled();
    });

    it('Digit2 starts double player game', () => {
      const spy = jest
        .spyOn(implementation, 'startDoublePlayer')
        .mockImplementation(() => undefined);
      const event = new KeyboardEvent('keydown', { key: 'Digit2' });
      implementation.onkeydown(event);
      expect(spy).toBeCalled();
    });

    it('Escape stops game', () => {
      const spy = jest
        .spyOn(implementation, 'stop')
        .mockImplementation(() => undefined);
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      implementation.onkeydown(event);
      expect(spy).toBeCalledWith(true);
    });

    it('KeyQ moves left paddle up', () => {
      Object.defineProperty(implementation['_leftPaddle'], 'auto', {
        get: () => false,
      });
      const event = new KeyboardEvent('keydown', { key: 'KeyQ' });
      implementation.onkeydown(event);
      expect((Paddle as jest.Mock).mock.instances[0].moveUp).toBeCalled();
      expect((Paddle as jest.Mock).mock.instances[0].moveDown).not.toBeCalled();
    });

    it('KeyA moves left paddle down', () => {
      Object.defineProperty(implementation['_leftPaddle'], 'auto', {
        get: () => false,
      });
      const event = new KeyboardEvent('keydown', { key: 'KeyA' });
      implementation.onkeydown(event);
      expect((Paddle as jest.Mock).mock.instances[0].moveUp).not.toBeCalled();
      expect((Paddle as jest.Mock).mock.instances[0].moveDown).toBeCalled();
    });

    it('KeyP moves right paddle up', () => {
      Object.defineProperty(implementation['_rightPaddle'], 'auto', {
        get: () => false,
      });
      const event = new KeyboardEvent('keydown', { key: 'KeyP' });
      implementation.onkeydown(event);
      expect((Paddle as jest.Mock).mock.instances[1].moveUp).toBeCalled();
      expect((Paddle as jest.Mock).mock.instances[1].moveDown).not.toBeCalled();
    });

    it('KeyL moves right paddle down', () => {
      Object.defineProperty(implementation['_rightPaddle'], 'auto', {
        get: () => false,
      });
      const event = new KeyboardEvent('keydown', { key: 'KeyL' });
      implementation.onkeydown(event);
      expect((Paddle as jest.Mock).mock.instances[1].moveUp).not.toBeCalled();
      expect((Paddle as jest.Mock).mock.instances[1].moveDown).toBeCalled();
    });
  });

  describe('keyup events', () => {
    it('KeyQ stops left paddle moving up', () => {
      Object.defineProperty(implementation['_leftPaddle'], 'auto', {
        get: () => false,
      });
      const event = new KeyboardEvent('keyup', { key: 'KeyQ' });
      implementation.onkeyup(event);
      expect((Paddle as jest.Mock).mock.instances[0].stopMovingUp).toBeCalled();
      expect(
        (Paddle as jest.Mock).mock.instances[0].stopMovingDown
      ).not.toBeCalled();
    });

    it('KeyA stops left paddle moving down', () => {
      Object.defineProperty(implementation['_leftPaddle'], 'auto', {
        get: () => false,
      });
      const event = new KeyboardEvent('keyup', { key: 'KeyA' });
      implementation.onkeyup(event);
      expect(
        (Paddle as jest.Mock).mock.instances[0].stopMovingUp
      ).not.toBeCalled();
      expect(
        (Paddle as jest.Mock).mock.instances[0].stopMovingDown
      ).toBeCalled();
    });

    it('KeyP stops right paddle moving up', () => {
      Object.defineProperty(implementation['_rightPaddle'], 'auto', {
        get: () => false,
      });
      const event = new KeyboardEvent('keyup', { key: 'KeyP' });
      implementation.onkeyup(event);
      expect((Paddle as jest.Mock).mock.instances[1].stopMovingUp).toBeCalled();
      expect(
        (Paddle as jest.Mock).mock.instances[1].stopMovingDown
      ).not.toBeCalled();
    });

    it('KeyL stops right paddle moving down', () => {
      Object.defineProperty(implementation['_rightPaddle'], 'auto', {
        get: () => false,
      });
      const event = new KeyboardEvent('keyup', { key: 'KeyL' });
      implementation.onkeyup(event);
      expect(
        (Paddle as jest.Mock).mock.instances[1].stopMovingUp
      ).not.toBeCalled();
      expect(
        (Paddle as jest.Mock).mock.instances[1].stopMovingDown
      ).toBeCalled();
    });
  });

  it('shows footprints', () => {
    implementation.showFootprints(true);
    expect((Ball as jest.Mock).mock.instances[0].showFootprints).toBe(true);
  });

  it('shows predications', () => {
    implementation.showPredictions(true);
    expect((Paddle as jest.Mock).mock.instances[1].showPredications).toBe(true);
    expect((Paddle as jest.Mock).mock.instances[1].showPredications).toBe(true);
  });

  it('plays sounds', () => {
    implementation.playSounds(true);
    expect(implementation['_playSounds']).toBe(true);
  });
});
