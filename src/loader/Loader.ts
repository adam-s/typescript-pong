export interface Loadable<T> {
  data: T;
  load(): Promise<T>;
  isLoaded(): boolean;
}

/**
 * engine.start(loader).then(() => {});
 * ```
 */
export class Loader implements Loadable<Loadable<unknown>[]> {
  private _resourceList: Loadable<unknown>[] = [];
  private _index = 0;

  private _resourceCount = 0;
  private _numLoaded = 0;
  private _progressCounts: { [key: string]: number } = {};
  private _totalCounts: { [key: string]: number } = {};

  constructor(loadables?: Loadable<unknown>[]) {
    if (loadables) {
      this.addResources(loadables);
    }
  }

  public addResource(loadable: Loadable<unknown>) {
    const key = this._index++;
    this._resourceList.push(loadable);
    this._progressCounts[key] = 0;
    this._totalCounts[key] = 1;
    this._resourceCount++;
  }

  public addResources(loadables: Loadable<unknown>[]) {
    let i = 0;
    const len = loadables.length;

    for (i; i < len; i++) {
      this.addResource(loadables[i]);
    }
  }

  public isLoaded() {
    return this._numLoaded === this._resourceCount;
  }

  data: Loadable<unknown>[];

  public async load(): Promise<Loadable<unknown>[]> {
    await Promise.all(
      this._resourceList.map(async (r) => {
        try {
          return await r.load();
        } catch (error) {
          console.log('Loading error: ', error);
        } finally {
          // capture progress
          this._numLoaded++;
        }
      })
    );
    return (this.data = this._resourceList);
  }

  public markResourceComplete(): void {
    this._numLoaded++;
  }
}
