import mock from 'xhr-mock';
import { Engine } from '../../src/engine';
import { ImageSource, Loader } from '../../src/loader';
import { Pong } from '../../src/pong/Pong';

jest.mock('../../src/pong/Pong');

describe('loader', () => {
  // replace the real XHR object with the mock XHR object before each test
  beforeEach(() => mock.setup());

  // put the real XHR object back and clear the mocks after each test
  afterEach(() => mock.teardown());

  it('loads resources', () => {
    mock.get('http://src/assets/images/press1.png', { body: new Image() });
    const mockURL = jest.fn();
    Object.defineProperty(window.URL, 'createObjectURL', { value: mockURL });

    const mockDecode = jest.fn();
    Object.defineProperty(window.Image.prototype, 'decode', {
      value: mockDecode,
    });

    const game = new Pong();
    const engine = new Engine(game);
    const loader = new Loader();
    const press1 = new ImageSource('http://src/assets/images/press1.png');
    loader.addResource(press1);
    // Start the engine
    return engine.start(loader).then(() => {
      expect(press1.image).toBeInstanceOf(HTMLImageElement);
    });
  });
});
