// Copyright (c) 2013, Erik Onarheim -- https://github.com/excaliburjs/Excalibur
import { canPlayFile } from '../utils';
import { AudioContextFactory } from './AudioContext';
import { Loadable } from './Loader';
import { Resource } from './Resource';
import { WebAudioInstance } from './WebAudioInstance';

export interface Audio {
  /**
   * Whether the audio should loop (repeat forever)
   */
  loop: boolean;
  /**
   * The volume (between 0 and 1)
   */
  volume: number;

  /**
   * Whether or not any audio is playing
   */
  isPlaying(): boolean;

  /**
   * Will play the sound or resume if paused
   */
  play(): Promise<boolean>;

  /**
   * Pause the sound
   */
  pause(): void;

  /**
   * Stop playing the sound and reset
   */
  stop(): void;
}

export class AudioSource implements Audio, Loadable<AudioBuffer> {
  public data: AudioBuffer;
  private _resource: Resource<ArrayBuffer>;
  /**
   * Indicates whether the clip should loop when complete
   * @param value  Set the looping flag
   */
  public set loop(value: boolean) {
    this._loop = value;
  }
  public get loop(): boolean {
    return this._loop;
  }

  public set volume(value: number) {
    this._volume = value;
  }
  public get volume(): number {
    return this._volume;
  }

  public get duration(): number | undefined {
    return this._duration;
  }

  /**
   * Return array of Current AudioInstances playing or being paused
   */
  public get instances(): Audio[] {
    return this._tracks;
  }

  public get path() {
    return this._resource.path;
  }

  public set path(val: string) {
    this._resource.path = val;
  }

  private _loop = false;
  private _volume = 1;
  private _duration: number | undefined = undefined;
  private _isStopped = false;
  private _isPaused = false;
  private _tracks: Audio[] = [];
  private _audioContext = AudioContextFactory.create();

  /**
   * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
   */
  constructor(...paths: string[]) {
    this._resource = new Resource('', 'arraybuffer');
    for (const path of paths) {
      if (canPlayFile(path)) {
        this.path = path;
        break;
      }
    }
  }

  public isLoaded() {
    return !!this.data;
  }

  public async load(): Promise<AudioBuffer> {
    if (this.data) {
      return this.data;
    }
    const arraybuffer = await this._resource.load();
    const audiobuffer = await this.decodeAudio(arraybuffer.slice(0));
    this._duration =
      typeof audiobuffer === 'object' ? audiobuffer.duration : undefined;
    return (this.data = audiobuffer);
  }

  public async decodeAudio(data: ArrayBuffer): Promise<AudioBuffer> {
    try {
      return await this._audioContext.decodeAudioData(data.slice(0));
    } catch (e) {
      console.error(`Unable to decode this browser may not fully support this format,\
 or the file may be corrupt, if this is an mp3 try removing id3\
 tags and album art from the file.`);
      return await Promise.reject();
    }
  }

  /**
   * Returns how many instances of the sound are currently playing
   */
  public instanceCount(): number {
    return this._tracks.length;
  }

  /**
   * Whether or not the sound is playing right now
   */
  public isPlaying(): boolean {
    return this._tracks.some((t) => t.isPlaying());
  }

  /**
   * Play the sound, returns a promise that resolves when the sound is done playing
   * An optional volume argument can be passed in to play the sound. Max volume is 1.0
   */
  public play(volume?: number): Promise<boolean> {
    if (!this.isLoaded()) {
      console.warn(
        'Cannot start playing. Resource',
        this.path,
        'is not loaded yet'
      );

      return Promise.resolve(true);
    }

    if (this._isStopped) {
      console.warn('Cannot start playing. Engine is in a stopped state.');
      return Promise.resolve(false);
    }

    this.volume = volume || this.volume;

    if (this._isPaused) {
      return this._resumePlayback();
    } else {
      return this._startPlayback();
    }
  }

  /**
   * Stop the sound, and do not rewind
   */
  public pause() {
    if (!this.isPlaying()) {
      return;
    }

    for (const track of this._tracks) {
      track.pause();
    }

    this._isPaused = true;
  }

  /**
   * Stop the sound if it is currently playing and rewind the track. If the sound is not playing, rewinds the track.
   */
  public stop() {
    for (const track of this._tracks) {
      track.stop();
    }

    this._isPaused = false;
    this._tracks.length = 0;
  }

  /**
   * Get Id of provided AudioInstance in current trackList
   * @param track [[Audio]] which Id is to be given
   */
  public getTrackId(track: Audio): number {
    return this._tracks.indexOf(track);
  }

  private async _resumePlayback(): Promise<boolean> {
    if (this._isPaused) {
      const resumed: Promise<boolean>[] = [];
      // ensure we resume *current* tracks (if paused)
      for (const track of this._tracks) {
        resumed.push(track.play());
      }
      this._isPaused = false;
      // resolve when resumed tracks are done
      await Promise.all(resumed);
    }
    return true;
  }

  /**
   * Starts playback, returns a promise that resolves when playback is complete
   */
  private async _startPlayback(): Promise<boolean> {
    const track = await this._getTrackInstance(this.data);

    const complete = await track.play();

    // when done, remove track
    this._tracks.splice(this.getTrackId(track), 1);

    return complete;
  }

  private _getTrackInstance(data: AudioBuffer): WebAudioInstance {
    const newTrack = new WebAudioInstance(data);

    newTrack.loop = this.loop;
    newTrack.volume = this.volume;
    newTrack.duration = this.duration;

    this._tracks.push(newTrack);

    return newTrack;
  }
}
