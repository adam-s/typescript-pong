const createGain = {
  gain: {
    value: 1,
    setTargetAtTime: jest.fn(),
  },
  connect: jest.fn(),
};

const createBufferSource = {
  buffer: null as boolean | null,
  playbackRate: {
    setValueAtTime: jest.fn(),
    value: 1,
  },
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  onended: jest.fn(),
};

Object.defineProperty(createBufferSource, 'loop', {
  get: jest.fn(),
  set: jest.fn(),
});

Object.defineProperty(window, 'AudioContext', {
  value: jest.fn().mockImplementation(() => {
    return {
      createGain: jest.fn().mockImplementation(() => createGain),
      decodeAudioData: jest.fn(),
      createBufferSource: () => createBufferSource,
      destination: 'DESTINATION_NODE',
      currentTime: 1,
    };
  }),
});

Object.defineProperty(window, 'AudioBuffer', {
  value: jest
    .fn()
    .mockImplementation(({ length, numberOfChannels, sampleRate }) => {
      return {
        numberOfChannels,
        length,
        sampleRate,
        gain: 1,
        duration: 5000,
      };
    }),
});
