import './AudioContext.mock';
import { WebAudioInstance } from '../../src/loader/WebAudioInstance';

describe('WebAudioInstance', () => {
  let implementation: WebAudioInstance;
  let createNewBufferSourceSpy: jest.SpyInstance;
  let rememberStartTimeSpy: jest.SpyInstance;
  let volumeNodeConnectSpy: jest.SpyInstance;
  let startSpy: jest.SpyInstance;
  let wireUpOnEndedSpy: jest.SpyInstance;

  beforeEach(() => {
    implementation = new WebAudioInstance(
      new AudioBuffer({ length: 6, sampleRate: 1 })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createNewBufferSourceSpy = jest.spyOn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      implementation as any,
      '_createNewBufferSource'
    );
    rememberStartTimeSpy = jest.spyOn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      implementation as any,
      '_rememberStartTime'
    );
    volumeNodeConnectSpy = jest.spyOn(implementation['_volumeNode'], 'connect');
    startSpy = jest.spyOn(implementation['_instance'], 'start');
    wireUpOnEndedSpy = jest.spyOn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      implementation as any,
      '_wireUpOnEnded'
    );
    jest.clearAllMocks();
  });

  it('should exist', () => {
    expect(WebAudioInstance).toBeDefined();
  });

  it('can be created', () => {
    expect(implementation).toBeDefined();
    expect(implementation).toMatchSnapshot();
  });

  it('loops', () => {
    const wireUpSpy = jest.spyOn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      implementation as any,
      '_wireUpOnEnded'
    );
    implementation.loop = true;
    expect(wireUpSpy).toBeCalledTimes(1);
  });

  it('volume is clamped to 0', () => {
    implementation.volume = 0.5;
    expect(implementation.volume).toBe(0.5);
    implementation.volume = -1;
    expect(implementation.volume).toBe(0);
  });

  it('volume is clamped to 1', () => {
    implementation.volume = 0.5;
    expect(implementation.volume).toBe(0.5);
    implementation.volume = 2;
    expect(implementation.volume).toBe(1);
  });

  it('calls setTargetAtTime if playing and volume is set', () => {
    const setTargetAtTimeSpy = jest.spyOn(
      implementation['_volumeNode'].gain,
      'setTargetAtTime'
    );
    implementation['_isPlaying'] = true;
    implementation.volume = 0.5;
    expect(setTargetAtTimeSpy).toBeCalledWith(0.5, 1, 0.1);
  });

  it('gets playback rate', () => {
    expect(implementation['_playbackRate']).toBe(1);
  });

  it('plays if paused', () => {
    const playStarted = jest.fn();
    implementation['_isPaused'] = true;
    implementation.play(playStarted);
    expect(playStarted).toBeCalled();
  });

  it('plays if not playing', () => {
    const playStarted = jest.fn();
    implementation['_isPlaying'] = false;
    implementation.play(playStarted);
    expect(playStarted).toBeCalled();
  });

  it('pauses', () => {
    const stopSpy = jest.spyOn(implementation['_instance'], 'stop');
    const setPauseOffsetSpy = jest.spyOn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      implementation as any,
      '_setPauseOffset'
    );
    implementation['_isPlaying'] = true;
    implementation.pause();
    expect(stopSpy).toBeCalledWith(0);
    expect(setPauseOffsetSpy).toBeCalled();
    expect(implementation['_isPaused']).toBe(true);
    expect(implementation['_isPlaying']).toBe(false);
  });

  it('stops', () => {
    const stopSpy = jest.spyOn(implementation['_instance'], 'stop');
    implementation['_isPlaying'] = true;
    implementation.stop();
    expect(stopSpy).toBeCalledWith(0);
    expect(implementation['_isPaused']).toBe(false);
    expect(implementation['_isPlaying']).toBe(false);
    expect(implementation['_currentOffset']).toBe(0);
  });

  it('starts playback', () => {
    implementation['_isPlaying'] = false;
    implementation['_isPaused'] = true;
    implementation['_currentOffset'];
    implementation['_startPlayBack']();
    expect(implementation['_isPlaying']).toBe(true);
    expect(implementation['_isPaused']).toBe(false);
    expect(rememberStartTimeSpy).toBeCalled();
    expect(volumeNodeConnectSpy).toBeCalledWith(
      implementation['_audioContext'].destination
    );
    expect(startSpy).toBeCalledWith(0, 0);
    expect(implementation['_currentOffset']).toBe(0);
    expect(wireUpOnEndedSpy).toBeCalled();
    delete implementation['_instance'];
    expect(createNewBufferSourceSpy).not.toBeCalled();
    implementation['_startPlayBack']();
    expect(createNewBufferSourceSpy).toBeCalled();
  });

  it('resumes play back', () => {
    implementation['_isPaused'] = true;
    implementation['_isPlaying'] = false;
    implementation['_currentOffset'] = 50;
    implementation['_resumePlayBack']();
    expect(implementation['_isPaused']).toBe(false);
    expect(implementation['_isPlaying']).toBe(true);
    expect(createNewBufferSourceSpy).toBeCalled();
    expect(rememberStartTimeSpy).toBeCalledWith(-50000);
    expect(startSpy).toBeCalledWith(0, 50);
    expect(wireUpOnEndedSpy).toBeCalled();
  });

  it('wires up on ended', () => {
    implementation['loop'] = false;
    implementation['_instance'].onended = null;
    implementation['_wireUpOnEnded']();
    expect(typeof implementation['_instance'].onended).toBe('function');
  });

  it("remember's start time", () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());
    implementation['_rememberStartTime'](1000);
    expect(implementation['_startTime']).toBe(1577836801000);
  });

  it('sets pause offset', () => {
    expect(implementation['_currentOffset']).toBe(0);
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());
    implementation['_startTime'] = 1;
    implementation['_setPauseOffset']();
    expect(implementation['_currentOffset']).toBe(1577836799.999);
  });

  it('creates a new buffer source', () => {
    const mockSetValueAtTime = jest.fn();
    const mockConnect = jest.fn();
    const createBufferSourceSpy = jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(implementation['_audioContext'] as any, 'createBufferSource')
      .mockReturnValue({
        buffer: null,
        loop: null,
        playbackRate: {
          setValueAtTime: mockSetValueAtTime,
        },
        connect: mockConnect,
      });
    implementation['_createNewBufferSource']();
    expect(createBufferSourceSpy).toBeCalled();
    expect(implementation['_instance'].buffer).toBe(implementation['_src']);
    expect(implementation['_instance'].loop).toBe(implementation['loop']);
    expect(mockSetValueAtTime).toBeCalledWith(1.0, 0);
    expect(mockConnect).toBeCalledWith(implementation['_volumeNode']);
  });
});
