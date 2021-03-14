import { Polygon } from 'view/draw';

export const isoToPixelCoords = (
  x: number,
  y: number,
  z?: number
): [number, number] => {
  return [x - y, (x + y) / 2 - (z ?? 0) / 2];
};

export const pixelToIsoCoords = (x: number, y: number): [number, number] => {
  return [(2 * y + x) / 2, (2 * y - x) / 2];
};

export const removeFileExtension = (fileName: string): string => {
  const ind = fileName.lastIndexOf('.');
  if (ind > -1) {
    fileName = fileName.slice(0, ind);
  }
  return fileName;
};

export type Point = [number, number];
export type Point3d = [number, number, number];
export type Circle = Point3d;

export const truncatePoint3d = (p: Point3d): Point => {
  return [p[0], p[1]];
};

export const extrapolatePoint = (p: Point): Point3d => {
  return [p[0], p[1], 0];
};

export type Rect = [number, number, number, number];

function easeOut(t: number, b: number, c: number, d: number): number {
  const t2 = t / d;
  return -c * t2 * (t2 - 2) + b;
}

export const randomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export function normalize(
  x: number,
  a: number,
  b: number,
  c: number,
  d: number
): number {
  return c + ((x - a) * (d - c)) / (b - a);
}

export function normalizeClamp(
  x: number,
  a: number,
  b: number,
  c: number,
  d: number
): number {
  let r = normalize(x, a, b, c, d);
  if (c < d) {
    if (r > d) {
      r = d;
    } else if (r < c) {
      r = c;
    }
  } else {
    if (r < d) {
      r = d;
    } else if (r > c) {
      r = c;
    }
  }
  return r;
}

export function normalizeEaseOut(
  x: number,
  a: number,
  b: number,
  c: number,
  d: number
): number {
  const t = normalize(x, a, b, 0, 1);
  return easeOut(t, c, d - c, 1);
}

export function normalizeEaseOutClamp(
  x: number,
  a: number,
  b: number,
  c: number,
  d: number
): number {
  const t = normalizeClamp(x, a, b, 0, 1);
  return easeOut(t, c, d - c, 1);
}

export const timeoutPromise = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export const getRandBetween = (a: number, b: number): number => {
  return Math.floor(Math.random() * (b - a)) + a;
};

export const removeIfPresent = (arr: any[], item: any): boolean => {
  const ind = arr.indexOf(item);
  if (ind > -1) {
    arr.splice(ind, 1);
    return true;
  }
  return false;
};

export const calculateDistance = (a: Point3d, b: Point3d) => {
  const [x1, y1, z1] = a;
  const [x2, y2, z2] = b;
  return Math.sqrt(
    Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
  );
};

export const circleCircleCollision = (a: Circle, b: Circle): boolean => {
  const [x1, y1, r1] = a;
  const [x2, y2, r2] = b;

  const dist = calculateDistance([x1, y1, 0], [x2, y2, 0]);
  return dist <= r1 + r2;
};

type CircleRectCollision =
  | 'none'
  | 'bottom'
  | 'left'
  | 'top'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
export const circleRectCollision = (
  c: Circle,
  r2: Rect
): CircleRectCollision => {
  const [cx, cy, cr] = c;
  const r1 = [cx - cr, cy - cr, cr * 2, cr * 2];

  const [r1x, r1y, r1w, r1h] = r1;
  const [r2x, r2y, r2w, r2h] = r2;

  const dx = r1x + r1w / 2 - (r2x + r2w / 2);
  const dy = r1y + r1h / 2 - (r2y + r2h / 2);
  const width = (r1w + r2w) / 2;
  const height = (r1h + r2h) / 2;
  const crossWidth = width * dy;
  const crossHeight = height * dx;
  let collision: CircleRectCollision = 'none';

  if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
    if (crossWidth > crossHeight) {
      collision = crossWidth > -crossHeight ? 'bottom' : 'left';
    } else {
      collision = crossWidth > -crossHeight ? 'right' : 'top';
    }

    if (cx <= r2x && cy <= r2y) {
      collision = 'top-left';
    } else if (cx >= r2x + r2w && cy <= r2y) {
      collision = 'top-right';
    } else if (cx <= r2x && cy >= r2y + r2h) {
      collision = 'bottom-left';
    } else if (cx >= r2x + r2w && cy >= r2y + r2h) {
      collision = 'bottom-right';
    }
  }

  return collision;
};

export function getAngleTowards(
  point1: Point3d | Point,
  point2: Point3d | Point
): number {
  const [x1, y1] = point1;
  const [x2, y2] = point2;
  const lenY = y2 - y1;
  const lenX = x2 - x1;
  const hyp = Math.sqrt(lenX * lenX + lenY * lenY);
  let ret = 0;
  if (y2 >= y1 && x2 >= x1) {
    ret = (Math.asin(lenY / hyp) * 180) / Math.PI + 90;
  } else if (y2 >= y1 && x2 < x1) {
    ret = (Math.asin(lenY / -hyp) * 180) / Math.PI - 90;
  } else if (y2 < y1 && x2 > x1) {
    ret = (Math.asin(lenY / hyp) * 180) / Math.PI + 90;
  } else {
    ret = (Math.asin(-lenY / hyp) * 180) / Math.PI - 90;
  }
  if (ret >= 360) {
    ret = 360 - ret;
  }
  if (ret < 0) {
    ret = 360 + ret;
  }
  return ret;
}

export const getNormalizedVec = (x: number, y: number): [number, number] => {
  const d = Math.sqrt(x * x + y * y);
  return [x / d, y / d];
};

export const radiansToDegrees = (rad: number) => {
  return rad * (180 / Math.PI);
};

export const getAngleFromVector = (x: number, y: number): number => {
  if (x == 0) {
    return y > 0 ? 90 : y == 0 ? 0 : 270;
  } else if (y == 0) {
    return x >= 0 ? 0 : 180;
  }
  let ret = radiansToDegrees(Math.atan(y / x));
  if (x < 0 && y < 0) {
    ret = 180 + ret;
  } else if (x < 0) {
    ret = 180 + ret;
  } else if (y < 0) {
    ret = 270 + (90 + ret);
  }
  return ret;
};

export const createPolygonFromRect = (r: Rect): Polygon => {
  const [x, y, width, height] = r;
  const polygon: Polygon = [
    [x, y] as Point,
    [x + width, y] as Point,
    [x + width, y + height] as Point,
    [x, y + height] as Point,
  ];
  return polygon;
};

export const toFixedPrecision = (n: number, precision: number): number => {
  return parseFloat(n.toFixed(precision));
};
