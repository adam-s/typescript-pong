import { Loadable } from './Loader';
import { Resource } from './Resource';

export class ImageSource implements Loadable<HTMLImageElement> {
  private _resource: Resource<Blob>;

  public get width() {
    return this.image.naturalWidth;
  }

  public get height() {
    return this.image.naturalHeight;
  }

  public isLoaded(): boolean {
    return !!this.data.src;
  }

  public data: HTMLImageElement = new Image();
  public get image(): HTMLImageElement {
    return this.data;
  }

  public ready: Promise<HTMLImageElement>;
  private _loadedResolve: (
    value?: HTMLImageElement | PromiseLike<HTMLImageElement>
  ) => void;

  constructor(public readonly path: string, bustCache = false) {
    this._resource = new Resource(path, 'blob', bustCache);
    if (path.endsWith('.svg') || path.endsWith('.gif')) {
      console.warn(
        `Image type is not fully supported, you may have mixed results ${path}. Fully supported: jpg, bmp, and png`
      );
    }
    this.ready = new Promise<HTMLImageElement>((resolve) => {
      this._loadedResolve = resolve;
    });
  }

  async load(): Promise<HTMLImageElement> {
    if (this.isLoaded()) {
      return this.data;
    }

    try {
      // Load base64 or blob if needed
      let url: string;
      if (!this.path.includes('data:image/')) {
        const blob = await this._resource.load();
        url = URL.createObjectURL(blob);
      } else {
        url = this.path;
      }
      // Decode the image
      const image = new Image();
      image.src = url;
      await image.decode();

      // Set results
      this.data = image;
    } catch (error) {
      throw `Error loading ImageSource from path '${this.path}' with error [${error.message}]`;
    }
    // todo emit complete
    this._loadedResolve(this.data);
    return this.data;
  }

  unload(): void {
    this.data = new Image();
  }
}
