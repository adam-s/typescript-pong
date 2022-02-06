import { EventDispatcher } from '../utils';
import { Loadable } from './Loader';

export class Resource<T> implements Loadable<T> {
  public data: T = null;
  public events: EventDispatcher = new EventDispatcher();

  constructor(
    public path: string,
    public responseType:
      | ''
      | 'arraybuffer'
      | 'blob'
      | 'document'
      | 'json'
      | 'text',
    public bustCache: boolean = true
  ) {}

  // This is fun. Use on and emit to delegate to the eventing. Need to bind the events instance to the on method though.
  get on() {
    return this.events.on.bind(this.events);
  }

  get emit() {
    return this.events.emit.bind(this.events);
  }

  public isLoaded(): boolean {
    return this.data !== null;
  }

  private _cacheBust(uri: string): string {
    const query = /\?\w*=\w*/;
    if (query.test(uri)) {
      uri += '&__=' + Date.now();
    } else {
      uri += '?__=' + Date.now();
    }
    return uri;
  }

  /**
   * Begin loading the resource and returns a promise to be resolved on completion
   */
  public load(): Promise<T> {
    return new Promise((resolve, reject) => {
      // Exit early if we already have data
      if (this.data !== null) {
        this.emit('complete', this.data as unknown);
        resolve(this.data);
        return;
      }

      const request = new XMLHttpRequest();
      request.open(
        'GET',
        this.bustCache ? this._cacheBust(this.path) : this.path,
        true
      );
      request.responseType = this.responseType;
      request.addEventListener('loadstart', (e) =>
        this.emit('loadstart', e as unknown)
      );
      request.addEventListener('progress', (e) =>
        this.emit('progress', e as unknown)
      );
      request.addEventListener('error', (e) =>
        this.emit('error', e as unknown)
      );
      request.addEventListener('load', (e) => this.emit('load', e as unknown));
      request.addEventListener('load', () => {
        // XHR on file:// success status is 0, such as with PhantomJS
        if (request.status !== 0 && request.status !== 200) {
          this.emit('error', request.response);
          reject(new Error(request.statusText));
          return;
        }

        this.data = request.response;
        this.emit('complete', this.data as unknown);
        resolve(this.data);
      });
      request.send();
    });
  }
}
