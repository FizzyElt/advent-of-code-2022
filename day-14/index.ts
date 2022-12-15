import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';

import { split, trim, times, range, join, prop, identity, filter, equals } from 'ramda';

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

const simulateSandFallDown = (params: {
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

const process = (params: { map: string[][]; startPosition: Position; minCol: number }) => {
  while (true) {
    const { isFull, map } = simulateSandFallDown(params);

    if (isFull) return map;
  }

  return params.map;
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

    return process({ map, startPosition: [500, 0], minCol: params.minCol });
  },
  A.chain(identity),
  filter(equals('O')),
  prop('length')
);

pipe(
  getDataContent('./day-14/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log(res)
  )
)();

const createMap2 = (params: { maxCol: number; minCol: number; maxRow: number }): string[][] => {
  const { maxRow } = params;
  console.log(params);
  return times(() => {
    return new Array((maxRow + 3) * 2 + 3).fill('.');
  }, maxRow + 3);
};

const drawStones2 = (params: {
  minCol: number;
  map: string[][];
  data: Position[][];
}): string[][] => {
  const { map, data } = params;
  const offset = map.length + 1 - 500;

  data.forEach((lines) => {
    lines.reduce<Position | null>((prev, pos) => {
      if (prev === null) return pos;
      const [prevX, prevY] = prev;
      const [x, y] = pos;

      if (prevX === x) {
        const line = prevY > y ? range(y, prevY + 1) : range(prevY, y + 1);
        line.forEach((y) => (map[y][x + offset] = '#'));
      }
      if (prevY === y) {
        const line = prevX > x ? range(x, prevX + 1) : range(prevX, x + 1);
        line.forEach((x) => (map[y][x + offset] = '#'));
      }

      return pos;
    }, null);
  });

  map[map.length - 1].forEach((_, index) => {
    map[map.length - 1][index] = '#';
  });
  return map;
};

const simulateSandFallDown2 = (params: {
  startPosition: Position;
  map: string[][];
  minCol: number;
}): {
  isFull: boolean;
  map: string[][];
} => {
  const { map, startPosition } = params;
  const bottom = map.length;
  let [x, y] = startPosition;

  if (map[y][x] === 'O')
    return {
      isFull: true,
      map,
    };

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

const process2 = (params: { map: string[][]; startPosition: Position; minCol: number }) => {
  while (true) {
    const { isFull, map } = simulateSandFallDown2(params);

    if (isFull) return map;
  }

  return params.map;
};

const part2Flow = flow(
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
      map: createMap2(mapSizeInfo),
      data,
    };
  },
  (params) => {
    const map = drawStones2(params);

    return process2({ map, startPosition: [map.length + 2, 0], minCol: params.minCol });
  },
  A.chain(identity),
  filter(equals('O')),
  prop('length')
);

pipe(
  getDataContent('./day-14/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log(res)
  )
)();
