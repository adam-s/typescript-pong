import 'jest-canvas-mock';
import { Engine, Game, IGameOptions } from '../../src/engine';

describe('Engine', () => {
  it('exists', () => {
    expect(Engine).toBeDefined();
  });

  const gameMock: Game = {
    width: 0,
    height: 0,
    start: () => null,
    stop: () => null,
    update: () => null,
    draw: () => null,
  };

  const options: IGameOptions = {
    fps: 0,
    stats: true,
    width: 600,
    height: 400,
  };

  it('has default values', () => {
    const implementation = new Engine(gameMock);
    expect(implementation['_options'].fps).toEqual(60);
  });

  it('overrides default values', () => {
    const implementation = new Engine(gameMock, options);
    expect(implementation['_options'].fps).toEqual(0);
  });

  it('creates a front and back canvas element', () => {
    const implementation = new Engine(gameMock, options);
    expect(implementation['_front']).toBeDefined();
    expect(implementation['_back']).toBeDefined();
  });

  it('creates a canvas element if a canvasElementId is passed in options', () => {
    // Initialize the DOM
    const canvasElementId = 'test';
    document.body.innerHTML = `<div><canvas id="${canvasElementId}"></canvas></div>`;
    const optionsWithCanvasElementId = Object.assign({}, options, {
      canvasElementId,
    });
    const implementation = new Engine(gameMock, optionsWithCanvasElementId);
    expect(implementation['_front']).toBeDefined();
  });

  it('renders stats to canvas', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const implementation = new Engine(gameMock, options);

    implementation.drawStats(ctx);
    const events = ctx.__getEvents();
    expect(events).toMatchSnapshot();
    ctx.__clearEvents();
  });

  it('adds events', () => {
    const documentSpy = jest
      .spyOn(document, 'addEventListener')
      .mockImplementation(() => undefined);
    new Engine(gameMock, options);
    expect(documentSpy.mock.calls[0][0]).toEqual('keyup');
    expect(documentSpy.mock.calls[1][0]).toEqual('keydown');
  });
});
