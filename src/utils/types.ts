// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// https://stackoverflow.com/a/66786182/494664
export type IndexesOfArray<A> = Exclude<keyof A, keyof []>;

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type Drawable = {
  draw: (ctx: CanvasRenderingContext2D, ...args: unknown[]) => void;
};

export type Updatable = {
  update: (dt: number, ...args: unknown[]) => void;
};

export type Position = {
  x: number;
  y: number;
};

export type Dimensions = {
  height: number;
  width: number;
};

export type BlockElement = Dimensions & Position;

export type ImageElement = { image: HTMLImageElement } & Position;

export type NumPlayers = 0 | 1 | 2;

export enum Keys {
  // NUMPAD
  Num0 = 'Numpad0',
  Num1 = 'Numpad1',
  Num2 = 'Numpad2',
  Num3 = 'Numpad3',
  Num4 = 'Numpad4',
  Num5 = 'Numpad5',
  Num6 = 'Numpad6',
  Num7 = 'Numpad7',
  Num8 = 'Numpad8',
  Num9 = 'Numpad9',
  NumAdd = 'NumpadAdd',
  NumSubtract = 'NumpadSubtract',
  NumMultiply = 'NumpadMultiply',
  NumDivide = 'NumpadDivide',
  // NumComma = 'NumpadComma', // not x-browser
  NumDecimal = 'NumpadDecimal',
  Numpad0 = 'Numpad0',
  Numpad1 = 'Numpad1',
  Numpad2 = 'Numpad2',
  Numpad3 = 'Numpad3',
  Numpad4 = 'Numpad4',
  Numpad5 = 'Numpad5',
  Numpad6 = 'Numpad6',
  Numpad7 = 'Numpad7',
  Numpad8 = 'Numpad8',
  Numpad9 = 'Numpad9',
  NumpadAdd = 'NumpadAdd',
  NumpadSubtract = 'NumpadSubtract',
  NumpadMultiply = 'NumpadMultiply',
  NumpadDivide = 'NumpadDivide',
  // NumpadComma = 'NumpadComma', // not x-browser
  NumpadDecimal = 'NumpadDecimal',

  // MODIFIERS
  NumLock = 'NumLock',
  ShiftLeft = 'ShiftLeft',
  ShiftRight = 'ShiftRight',
  AltLeft = 'AltLeft',
  AltRight = 'AltRight',

  // NUMBERS
  Key0 = 'Digit0',
  Key1 = 'Digit1',
  Key2 = 'Digit2',
  Key3 = 'Digit3',
  Key4 = 'Digit4',
  Key5 = 'Digit5',
  Key6 = 'Digit6',
  Key7 = 'Digit7',
  Key8 = 'Digit8',
  Key9 = 'Digit9',
  Digit0 = 'Digit0',
  Digit1 = 'Digit1',
  Digit2 = 'Digit2',
  Digit3 = 'Digit3',
  Digit4 = 'Digit4',
  Digit5 = 'Digit5',
  Digit6 = 'Digit6',
  Digit7 = 'Digit7',
  Digit8 = 'Digit8',
  Digit9 = 'Digit9',

  // LETTERS
  A = 'KeyA',
  B = 'KeyB',
  C = 'KeyC',
  D = 'KeyD',
  E = 'KeyE',
  F = 'KeyF',
  G = 'KeyG',
  H = 'KeyH',
  I = 'KeyI',
  J = 'KeyJ',
  K = 'KeyK',
  L = 'KeyL',
  M = 'KeyM',
  N = 'KeyN',
  O = 'KeyO',
  P = 'KeyP',
  Q = 'KeyQ',
  R = 'KeyR',
  S = 'KeyS',
  T = 'KeyT',
  U = 'KeyU',
  V = 'KeyV',
  W = 'KeyW',
  X = 'KeyX',
  Y = 'KeyY',
  Z = 'KeyZ',
  KeyA = 'KeyA',
  KeyB = 'KeyB',
  KeyC = 'KeyC',
  KeyD = 'KeyD',
  KeyE = 'KeyE',
  KeyF = 'KeyF',
  KeyG = 'KeyG',
  KeyH = 'KeyH',
  KeyI = 'KeyI',
  KeyJ = 'KeyJ',
  KeyK = 'KeyK',
  KeyL = 'KeyL',
  KeyM = 'KeyM',
  KeyN = 'KeyN',
  KeyO = 'KeyO',
  KeyP = 'KeyP',
  KeyQ = 'KeyQ',
  KeyR = 'KeyR',
  KeyS = 'KeyS',
  KeyT = 'KeyT',
  KeyU = 'KeyU',
  KeyV = 'KeyV',
  KeyW = 'KeyW',
  KeyX = 'KeyX',
  KeyY = 'KeyY',
  KeyZ = 'KeyZ',

  // SYMBOLS
  Semicolon = 'Semicolon',
  Quote = 'Quote',
  Comma = 'Comma',
  Minus = 'Minus',
  Period = 'Period',
  Slash = 'Slash',
  Equal = 'Equal',
  BracketLeft = 'BracketLeft',
  Backslash = 'Backslash',
  BracketRight = 'BracketRight',
  Backquote = 'Backquote',

  // DIRECTIONS
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',

  // OTHER
  Space = 'Space',
  Esc = 'Escape',
  Escape = 'Escape',
}
