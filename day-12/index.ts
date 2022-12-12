import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';

import { getDataContent } from '../utils/readFileTask';
import { trim, split, equals } from 'ramda';

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

const part1Flow = flow(sliceContent, createMap, (map) => ({
  start: findTargetCoord('S')(map),
  end: findTargetCoord('E')(map),
  map,
}));

pipe(
  getDataContent('./day-12/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log(res)
  )
)();
