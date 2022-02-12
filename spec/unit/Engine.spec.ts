import 'jest-canvas-mock';
import { Engine, Game, IGameOptions } from '../../src/engine';

jest.useFakeTimers();

describe('Engine', () => {
  it('exists', () => {
    expect(Engine).toBeDefined();
  });

  const gameMock: Game = {
    width: 100,
    height: 100,
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

  it('adds events', () => {
    const documentSpy = jest
      .spyOn(document, 'addEventListener')
      .mockImplementation(() => undefined);
    new Engine(gameMock, options);
    expect(documentSpy.mock.calls[0][0]).toEqual('keyup');
    expect(documentSpy.mock.calls[1][0]).toEqual('keydown');
  });

  it('starts a game', async () => {
    const implementation = new Engine(
      Object.assign({}, gameMock, { init: jest.fn() }),
      options
    );
    const loadSpy = jest.spyOn(implementation, 'load');
    const loopSpy = jest.spyOn(implementation, 'loop');
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());
    const mockLoad = jest.fn().mockResolvedValue(true);
    const loader = {
      load: mockLoad,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await implementation.start(loader as any).then(() => {
      console.log(loader);
    });
    expect(mockLoad).toBeCalled();
    expect(loadSpy).toBeCalledWith(loader);
    expect(implementation['game'].init).toBeCalled();
    expect(implementation['_lastFrame']).toBe(1577836800000);
    expect(loopSpy).not.toBeCalled();
    jest.advanceTimersByTime(implementation['_interval']);
    expect(loopSpy).toBeCalledTimes(1);
    jest.advanceTimersByTime(implementation['_interval']);
    jest.advanceTimersByTime(implementation['_interval']);
  });

  it('loads with a loader', async () => {
    const implementation = new Engine(gameMock, options);
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());
    const mockLoad = jest.fn().mockResolvedValue(true);
    const loader = {
      load: mockLoad,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await implementation.load(loader as any);
    expect(mockLoad).toBeCalled();
  });

  it('loops', () => {
    const implementation = new Engine(gameMock, options);
    const updateSpy = jest
      .spyOn(implementation, 'update')
      .mockImplementation(() => undefined);
    const drawSpy = jest
      .spyOn(implementation, 'draw')
      .mockImplementation(() => undefined);
    const updateStatsSpy = jest
      .spyOn(implementation, 'updateStats')
      .mockImplementation(() => undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest
      .spyOn(window.Date.prototype, 'getTime')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(2000)
      .mockReturnValue(3000);
    implementation['_lastFrame'] = 500;
    implementation.loop();
    expect(updateSpy).toBeCalledWith(0.5);
    expect(drawSpy).toBeCalled();
    expect(updateStatsSpy).toBeCalledWith(1000, 1000);
    expect(implementation['_lastFrame']).toBe(1000);
  });

  it('updates game', () => {
    const implementation = new Engine(gameMock, options);
    const gameUpdateSpy = jest
      .spyOn(implementation['game'], 'update')
      .mockImplementation(() => undefined);
    implementation['update'](1000);
    expect(gameUpdateSpy).toBeCalledWith(1000);
  });

  it('draws', () => {
    const canvasFront = document.createElement('canvas');
    const canvasBack = document.createElement('canvas');
    const ctxFront = canvasFront.getContext('2d');
    const ctxBack = canvasBack.getContext('2d');
    const implementation = new Engine(gameMock, options);
    implementation['_front2d'] = canvasFront.getContext('2d');
    implementation['_back2d'] = canvasBack.getContext('2d');

    implementation.draw();
    let events = ctxFront.__getEvents();
    expect(events).toMatchSnapshot();
    ctxFront.__clearEvents();
    events = ctxBack.__getEvents();
    expect(events).toMatchSnapshot();
    ctxBack.__clearEvents();
  });

  it('updates stats', () => {
    const implementation = new Engine(gameMock, options);
    implementation['_options'].stats = true;
    implementation['updateStats'](10, 50);
    expect(implementation['_stats']).toMatchSnapshot();
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

  it('alerts', () => {
    const implementation = new Engine(gameMock, options);
    const stopSpy = jest
      .spyOn(implementation, 'stop')
      .mockImplementation(() => undefined);
    const startSpy = jest
      .spyOn(implementation, 'start')
      .mockImplementation(() => undefined);
    const msg = 'alert';
    const alertSpy = jest.spyOn(window, 'alert');
    implementation.alert(msg);
    expect(startSpy).toBeCalled();
    expect(stopSpy).toBeCalled();
    expect(alertSpy).toBeCalledWith(msg);
  });

  it('confirms', () => {
    const implementation = new Engine(gameMock, options);
    const stopSpy = jest
      .spyOn(implementation, 'stop')
      .mockImplementation(() => undefined);
    const startSpy = jest
      .spyOn(implementation, 'start')
      .mockImplementation(() => undefined);
    const msg = 'confirm';
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    implementation.confirm(msg);
    expect(startSpy).toBeCalled();
    expect(stopSpy).toBeCalled();
    expect(confirm).toBeCalledWith(msg);
  });
});
