import './styles.scss';
import { Engine } from './engine/Engine';
import { Pong, loader } from './pong';

const pong = new Pong();
const engine = new Engine(pong, { canvasElementId: 'game' });

engine.start(loader).then(() => {
  const stats = document.getElementById('stats') as HTMLInputElement;
  const sound = document.getElementById('sound') as HTMLInputElement;
  const footprints = document.getElementById('footprints') as HTMLInputElement;
  const predictions = document.getElementById(
    'predictions'
  ) as HTMLInputElement;

  // engine.showStats(stats.checked);
  // pong.playSounds(sound.checked);
  // pong.showFootprints(footprints.checked);
  // pong.showPredictions(predictions.checked);

  stats.addEventListener('change', () => engine.showStats(stats.checked));
  sound.addEventListener('change', () => pong.playSounds(sound.checked));
  footprints.addEventListener('change', () =>
    pong.showFootprints(footprints.checked)
  );
  predictions.addEventListener('change', () =>
    pong.showPredictions(predictions.checked)
  );
});
