import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow, tuple } from 'fp-ts/function';

import { getDataContent } from '../utils/readFileTask';
import { trim, split, equals, whereEq, dec, modify, inc } from 'ramda';

type Coord = {
  x: number;
  y: number;
};

const sliceContent = flow(trim, split('\n'));

const createMap = A.map(split(''));

const findTargetCoord =
  (target: string) =>
  (map: string[][]): Coord => {
    return map.reduce(
      (coord, row, y) => {
        const x = row.findIndex(equals(target));
        return x !== -1 ? { x: x, y: y } : coord;
      },
      { x: 0, y: 0 }
    );
  };

const traveling = (map: string[][], { start, end }: { start: Coord; end: Coord }): number => {
  const queue = [tuple(0, start.y, start.x)];
  const rows = map.length;
  const cols = map[0].length;
  map[start.y][start.x] = 'a';

  const visited = new Set([`${start.y},${start.x}`]);

  while (queue.length > 0) {
    const [d = 0, row = 0, col = 0] = queue.shift() || [];
    for (const [newRow, newCol] of [
      [row + 1, col],
      [row - 1, col],
      [row, col + 1],
      [row, col - 1],
    ]) {
      if (newRow < 0 || newCol < 0 || newRow >= rows || newCol >= cols) continue;

      if (visited.has(`${newRow},${newCol}`)) continue;

      if (map[newRow][newCol].charCodeAt(0) - map[row][col].charCodeAt(0) > 1) continue;

      if (newRow === end.y && newCol === end.x) {
        return d + 1;
      }
      visited.add(`${newRow},${newCol}`);
      queue.push(tuple(d + 1, newRow, newCol));
    }
  }

  return 0;
};

const traveling2 = (map: string[][], { start, end }: { start: Coord; end: Coord }): number => {
  const queue = [tuple(0, end.y, end.x)];
  const rows = map.length;
  const cols = map[0].length;
  map[start.y][start.x] = 'a';
  map[end.y][end.x] = 'z';

  const visited = new Set([`${end.y},${end.x}`]);

  while (queue.length > 0) {
    const [d = 0, row = 0, col = 0] = queue.shift() || [];
    for (const [newRow, newCol] of [
      [row + 1, col],
      [row - 1, col],
      [row, col + 1],
      [row, col - 1],
    ]) {
      if (newRow < 0 || newCol < 0 || newRow >= rows || newCol >= cols) continue;

      if (visited.has(`${newRow},${newCol}`)) continue;

      if (map[newRow][newCol].charCodeAt(0) - map[row][col].charCodeAt(0) < -1) continue;

      if (map[newRow][newCol] === 'a') {
        return d + 1;
      }
      visited.add(`${newRow},${newCol}`);
      queue.push(tuple(d + 1, newRow, newCol));
    }
  }

  return 0;
};

const part1Flow = flow(
  sliceContent,
  createMap,
  (map) => ({
    start: findTargetCoord('S')(map),
    end: findTargetCoord('E')(map),
    map,
  }),
  ({ map, start, end }) => traveling(map, { start, end })
);

const part2Flow = flow(
  sliceContent,
  createMap,
  (map) => ({
    start: findTargetCoord('S')(map),
    end: findTargetCoord('E')(map),
    map,
  }),
  ({ map, start, end }) => traveling2(map, { start, end })
);

pipe(
  getDataContent('./day-12/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('part 1 answer is', res)
  )
)();

pipe(
  getDataContent('./day-12/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('part 2 answer is', res)
  )
)();
