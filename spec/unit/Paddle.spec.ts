/* eslint-disable @typescript-eslint/no-var-requires */
import 'jest-canvas-mock';
import { Paddle } from '../../src/pong';
import { Levels } from '../../src/pong';
import { Ball } from '../../src/pong';

describe('Paddle', () => {
  it('should exist', () => {
    expect(Paddle).toBeDefined();
  });
  let implementation: Paddle;
  const Config = require('../../src/pong/Pong').Config;

  beforeEach(() => {
    implementation = new Paddle(Config);
  });

  it('instantiates a paddle', () => {
    expect(implementation).toMatchSnapshot();
  });

  it('setdir positive', () => {
    implementation.setdir(10);
    expect(implementation).toMatchSnapshot();
  });

  it('setdir negative', () => {
    implementation.setdir(-10);
    expect(implementation).toMatchSnapshot();
  });

  it('setpos positive', () => {
    implementation.setpos(10, 10);
    expect(implementation).toMatchSnapshot();
  });

  it('setpos negative', () => {
    implementation.setpos(-10, -10);
    expect(implementation).toMatchSnapshot();
  });

  it('setAuto', () => {
    const setLevelSpy = jest.spyOn(implementation, 'setLevel');
    const setdirSpy = jest.spyOn(implementation, 'setdir');
    expect(implementation['auto']).toBe(false);
    implementation.setAuto(true, 8);
    expect(implementation['auto']).toBe(true);
    expect(implementation['level']).toBe(Levels[8]);
    // Set auto off
    implementation.setAuto(false);
    expect(implementation['auto']).toBe(false);
    expect(setdirSpy.mock.calls[0][0]).toBe(0);
    setLevelSpy.mockRestore();
    setdirSpy.mockRestore();
  });

  it('updates calling ai when auto is true', () => {
    const aiSpy = jest.spyOn(implementation, 'ai');
    const ball = new Ball(Config);
    implementation['_auto'] = true;
    implementation.update(0, ball);
    expect(aiSpy.mock.calls[0][0]).toEqual(0);
    expect(aiSpy.mock.calls[0][1]).toEqual(ball);
    aiSpy.mockRestore();
  });

  it('updates position', () => {
    const setposSpy = jest.spyOn(implementation, 'setpos');
    const ball = new Ball(Config);
    implementation['_up'] = 1;
    implementation.update(0.00007, ball);
    expect(setposSpy.mock.calls[0][1]).toEqual(209.98614);
    implementation.update(1, ball);
    expect(setposSpy.mock.calls[1][1]).toEqual(implementation['minY']);
    implementation['_up'] = 0;
    implementation['_down'] = 1;
    implementation.update(100, ball);
    expect(setposSpy.mock.calls[2][1]).toEqual(implementation['maxY']);
    setposSpy.mockRestore();
  });

  it('ai stops the ball if it passes boundary', () => {
    const stopMovingUpSpy = jest.spyOn(implementation, 'stopMovingUp');
    const stopMovingDownSpy = jest.spyOn(implementation, 'stopMovingDown');
    implementation['predict'] = () => undefined;

    const ball = new Ball(Config);

    // Passes left boundary
    ball['_x'] = -1;
    ball['_dx'] = -1;
    implementation.ai(0, ball);
    expect(stopMovingDownSpy).toBeCalled();
    expect(stopMovingUpSpy).toBeCalled();
    jest.clearAllMocks();

    // Passes right boundary
    ball['_x'] = 13;
    ball['_dx'] = 1;
    implementation.ai(0, ball);
    expect(stopMovingDownSpy).toBeCalled();
    expect(stopMovingUpSpy).toBeCalled();
    jest.clearAllMocks();

    // In play
    ball['_x'] = 7;
    ball['_dx'] = 0;
    implementation.ai(0, ball);
    expect(stopMovingDownSpy).not.toBeCalled();
    expect(stopMovingUpSpy).not.toBeCalled();
    jest.clearAllMocks();
  });

  it('reacts correctly to a prediction', () => {
    const predictSpy = jest
      .spyOn(implementation, 'predict')
      .mockImplementation();
    const stopMovingUpSpy = jest.spyOn(implementation, 'stopMovingUp');
    const stopMovingDownSpy = jest.spyOn(implementation, 'stopMovingDown');
    const moveUpSpy = jest.spyOn(implementation, 'moveUp');
    const moveDownSpy = jest.spyOn(implementation, 'moveDown');

    const ball = new Ball(Config);

    // Initialize the predication property
    implementation['prediction'] = {
      d: 'left',
      dx: 0,
      dy: 0,
      exactX: 0,
      exactY: 0,
      radius: 0,
      since: 0,
      x: 0,
      y: 0,
    };

    // (this.prediction.y < this.top + this.height / 2 - 5) | 235
    implementation['prediction']['y'] = 230;
    implementation.ai(0, ball);
    expect(predictSpy).toHaveBeenCalled();
    expect(stopMovingDownSpy).toHaveBeenCalled();
    expect(moveUpSpy).toHaveBeenCalled();
    expect(stopMovingUpSpy).not.toHaveBeenCalled();
    expect(moveDownSpy).not.toHaveBeenCalled();
    jest.clearAllMocks();

    //(this.prediction.y > this.bottom - this.height / 2 + 5) | 245
    implementation['prediction']['y'] = 250;
    implementation.ai(0, ball);
    expect(stopMovingUpSpy).toHaveBeenCalled();
    expect(moveDownSpy).toHaveBeenCalled();
    expect(stopMovingDownSpy).not.toHaveBeenCalled();
    expect(moveUpSpy).not.toHaveBeenCalled();
    jest.clearAllMocks();

    // prediction exits but not
    implementation['prediction']['y'] = 240;
    implementation.ai(0, ball);
    expect(stopMovingDownSpy).toHaveBeenCalled();
    expect(stopMovingUpSpy).toHaveBeenCalled();
    expect(moveDownSpy).not.toHaveBeenCalled();
    expect(moveUpSpy).not.toHaveBeenCalled();
    jest.clearAllMocks();
  });
});
