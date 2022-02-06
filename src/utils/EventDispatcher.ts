// Taken from https://github.com/excaliburjs/Excalibur
export interface Eventable {
  emit(eventName: string, event: unknown): void;
  on(eventName: string, handler: (event?: unknown) => void): void;
  off(eventName: string, handler?: (event?: unknown) => void): void;
  once(eventName: string, handler: (event?: unknown) => void): void;
}

export class EventDispatcher implements Eventable {
  private _handlers: { [key: string]: { (event?: unknown): void }[] } = {};

  public clear() {
    this._handlers = {};
  }

  public emit(eventName: string, event?: unknown) {
    if (!eventName) {
      // key not mapped
      return;
    }
    eventName = eventName.toLowerCase();
    let i: number, len: number;
    if (this._handlers[eventName]) {
      i = 0;
      len = this._handlers[eventName].length;

      for (i; i < len; i++) {
        const handler = this._handlers[eventName][i];
        typeof event !== 'undefined' ? handler(event) : handler();
      }
    }
  }

  public on(eventName: string, handler: (event?: unknown) => void) {
    eventName = eventName.toLowerCase();
    if (!this._handlers[eventName]) {
      this._handlers[eventName] = [];
    }
    this._handlers[eventName].push(handler);
  }

  public off(eventName: string, handler: (event?: unknown) => void) {
    eventName = eventName.toLowerCase();
    const eventHandlers = this._handlers[eventName];

    if (eventHandlers) {
      // if no explicit handler is give with the event name clear all handlers
      if (!handler) {
        this._handlers[eventName].length = 0;
      } else {
        const index = eventHandlers.indexOf(handler);
        this._handlers[eventName].splice(index, 1);
      }
    }
  }

  public once(eventName: string, handler: (event?: unknown) => void) {
    const metaHandler = (event?: unknown) => {
      this.off(eventName, handler);
      typeof event !== 'undefined' ? handler(event) : handler();
    };

    this.on(eventName, metaHandler);
  }
}
