import { EventDispatcher } from '../../src/utils';

describe('EventDispatcher', () => {
  let pubsub: EventDispatcher;
  beforeEach(() => {
    pubsub = new EventDispatcher();
  });

  it('exists', () => {
    expect(EventDispatcher).toBeDefined();
  });

  it('can be initiated', () => {
    expect(pubsub).toBeTruthy();
  });

  it('can publish events', () => {
    const callback = jest.fn();
    pubsub.on('event', callback);
    pubsub.emit('event');
    expect(callback).toBeCalled();
  });

  it('can turn the emitter off', () => {
    const callback = jest.fn();
    pubsub.on('event', callback);
    pubsub.emit('event');
    expect(callback).toBeCalledTimes(1);
    pubsub.emit('event');
    expect(callback).toBeCalledTimes(2);
    pubsub.off('event', callback);
    pubsub.emit('event');
    expect(callback).toBeCalledTimes(2);
  });

  it('only emits event once', () => {
    const callback = jest.fn();
    pubsub.once('event', callback);
    pubsub.emit('event');
    expect(callback).toBeCalledTimes(1);
    pubsub.emit('event');
    expect(callback).toBeCalledTimes(1);
  });

  it('can clear all handlers', () => {
    const callback = jest.fn();
    pubsub.on('event', callback);
    pubsub.emit('event');
    expect(callback).toBeCalledTimes(1);
    pubsub.clear();
    pubsub.emit('event');
    expect(callback).toBeCalledTimes(1);
  });
});
