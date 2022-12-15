import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';

import { split, trim, times, range, join, prop, identity } from 'ramda';

import { getDataContent } from '../utils/readFileTask';

type Position = [number, number];

const sliceContent = flow(trim, split('\n'));

const parseLine = flow(split(' -> '), A.map(flow(split(','), A.map(parseInt)))) as (
  line: string
) => Position[];

const createMap = (params: { maxCol: number; minCol: number; maxRow: number }): string[][] => {
  const { maxCol, minCol, maxRow } = params;

  return times(() => {
    return new Array(maxCol + 1 - (minCol - 1) + 1).fill('.');
  }, maxRow + 1);
};

const drawStones = (params: {
  minCol: number;
  map: string[][];
  data: Position[][];
}): string[][] => {
  const { map, data, minCol } = params;

  data.forEach((lines) => {
    lines.reduce<Position | null>((prev, pos) => {
      if (prev === null) return pos;
      const [prevX, prevY] = prev;
      const [x, y] = pos;

      if (prevX === x) {
        const line = prevY > y ? range(y, prevY + 1) : range(prevY, y + 1);
        line.forEach((y) => (map[y][x - minCol] = '#'));
      }
      if (prevY === y) {
        const line = prevX > x ? range(x, prevX + 1) : range(prevX, x + 1);
        line.forEach((x) => (map[y][x - minCol] = '#'));
      }

      return pos;
    }, null);
  });
  return map;
};

const simulateSandMove = (params: {
  startPosition: Position;
  map: string[][];
  minCol: number;
}): {
  isFull: boolean;
  map: string[][];
} => {
  const { map, minCol, startPosition } = params;
  const bottom = map.length;
  let [x, y] = startPosition;
  x -= minCol;

  while (y + 1 < bottom) {
    const [left, mid, right] = [map[y + 1][x - 1], map[y + 1][x], map[y + 1][x + 1]];

    if (mid === '.') {
      y += 1;
      continue;
    }

    if (left === '.') {
      x -= 1;
      y += 1;
      continue;
    }

    if (right === '.') {
      x += 1;
      y += 1;
      continue;
    }

    map[y][x] = 'O';
    return {
      isFull: false,
      map,
    };
  }
  return {
    isFull: true,
    map,
  };
};

const part1Flow = flow(
  sliceContent,
  A.map(parseLine),
  (data) => {
    const flatPositions = data.flat();
    const mapSizeInfo = flatPositions.reduce(
      (acc, [col, row]) => {
        col > acc.maxCol && (acc.maxCol = col);
        col < acc.minCol && (acc.minCol = col);
        row > acc.maxRow && (acc.maxRow = row);
        return acc;
      },
      {
        maxCol: 0,
        minCol: Infinity,
        maxRow: 0,
      }
    );
    return {
      minCol: mapSizeInfo.minCol - 1,
      map: createMap(mapSizeInfo),
      data,
    };
  },
  (params) => {
    const map = drawStones(params);
    const result = times(identity, 20).reduce(
      (acc) => {
        const res = simulateSandMove(acc);

        return {
          ...acc,
          map: res.map,
        };
      },
      {
        map,
        startPosition: [500, 0] as Position,
        minCol: params.minCol,
      }
    );
    return result;
  },
  prop('map'),
  A.map(join('')),
  join('\n')
);

pipe(
  getDataContent('./day-14/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log(res)
  )
)();
