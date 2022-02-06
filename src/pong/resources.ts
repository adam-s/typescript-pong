import { ImageSource, AudioSource, Loader } from '../loader';

const loader = new Loader();

const images = {
  press1: new ImageSource('/assets/images/press1.png'),
  press2: new ImageSource('/assets/images/press2.png'),
  winner: new ImageSource('/assets/images/winner.png'),
};

for (const res in images) {
  loader.addResource(images[res as keyof typeof images]);
}

const sounds = {
  ping: new AudioSource('/assets/sounds/ping.wav'),
  pong: new AudioSource('/assets/sounds/pong.wav'),
  wall: new AudioSource('/assets/sounds/wall.wav'),
  goal: new AudioSource('/assets/sounds/goal.wav'),
};

for (const res in sounds) {
  const sound = sounds[res as keyof typeof sounds];
  sound.volume = 0.5;
  loader.addResource(sound);
}

export { images, sounds, loader };
