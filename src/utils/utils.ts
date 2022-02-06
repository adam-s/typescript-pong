/* eslint-disable @typescript-eslint/no-empty-function */
export const timestamp = () => {
  return new Date().getTime();
};

interface AccelerateParameters {
  x: number;
  y: number;
  dx: number;
  dy: number;
  accel: number;
  dt: number;
}

interface Position {
  nx: number;
  ny: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export const accelerate = ({
  x,
  y,
  dx,
  dy,
  accel,
  dt,
}: AccelerateParameters): Position => {
  const x2 = x + dt * dx + accel * dt * dt * 0.5;
  const y2 = y + dt * dy + accel * dt * dt * 0.5;
  const dx2 = dx + accel * dt * (dx > 0 ? 1 : -1);
  const dy2 = dy + accel * dt * (dy > 0 ? 1 : -1);
  return { nx: x2 - x, ny: y2 - y, x: x2, y: y2, dx: dx2, dy: dy2 };
};

export type Direction = 'left' | 'right' | 'top' | 'bottom';

interface InterceptParameters {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
  d: Direction; // Direction
}

export type Intercept = {
  x: number;
  y: number;
  d: Direction;
} | null;

export const intercept = ({
  x1,
  y1,
  x2,
  y2,
  x3,
  y3,
  x4,
  y4,
  d,
}: InterceptParameters): Intercept => {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom != 0) {
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    if (ua >= 0 && ua <= 1) {
      const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
      if (ub >= 0 && ub <= 1) {
        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);
        return { x: x, y: y, d: d };
      }
    }
  }
  return null;
};

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(min, val), max);
}

export function canPlayFile(file: string): boolean {
  try {
    const audio = document.createElement('audio');
    const filetype = /.*\.([A-Za-z0-9]+)$/;
    const type = file.match(filetype)[1];
    if (audio.canPlayType('audio/' + type)) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.warn('Cannot determine audio support', e);
    return false;
  }
}
