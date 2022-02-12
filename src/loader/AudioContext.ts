// Copyright (c) 2013, Erik Onarheim -- https://github.com/excaliburjs/Excalibur
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export class AudioContextFactory {
  private static _INSTANCE: AudioContext = null;

  public static create(): AudioContext {
    if (!this._INSTANCE) {
      const AudioConstructor = window.AudioContext || window.webkitAudioContext;
      if (AudioConstructor) {
        this._INSTANCE = new AudioConstructor({});
      }
    }

    return this._INSTANCE;
  }
}
