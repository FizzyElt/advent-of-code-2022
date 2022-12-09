import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';

import {
  split,
  times,
  curry,
  cond,
  whereEq,
  T,
  trim,
  always,
  equals,
  prop,
  identity,
  tap,
} from 'ramda';

import { getDataContent } from '../utils/readFileTask';

type Coord = { x: number; y: number };

const directions = {
  U: { x: 0, y: 1 },
  D: { x: 0, y: -1 },
  R: { x: 1, y: 0 },
  L: { x: -1, y: 0 },
  UR: { x: 1, y: 1 },
  UL: { x: -1, y: 1 },
  DR: { x: 1, y: -1 },
  DL: { x: -1, y: -1 },
};

const createCoord = (x: number, y: number): Coord => ({ x, y });

const addCoord = curry((a: Coord, b: Coord): Coord => createCoord(a.x + b.x, a.y + b.y));

const subtractCoord = curry((a: Coord, b: Coord): Coord => createCoord(a.x - b.x, a.y - b.y));

const sliceContent = flow(trim, split('\n'));

const parseMoveStr = flow(split(' '), ([direction, times]) => [direction, parseInt(times)]) as (
  s: string
) => [string, number];

const convertCoordString = (coord: Coord) => `${coord.x},${coord.y}`;

const getMoveCoord = cond([
  [equals('U'), always(directions.U)],
  [equals('D'), always(directions.D)],
  [equals('R'), always(directions.R)],
  [equals('L'), always(directions.L)],
  [T, always({ x: 0, y: 0 })],
]);

const getDirectionCoord = cond<[Coord], Coord>([
  [whereEq({ x: -2 }), always(directions.L)],
  [whereEq({ x: 2 }), always(directions.R)],
  [whereEq({ y: -2 }), always(directions.D)],
  [whereEq({ y: 2 }), always(directions.U)],
  [T, identity],
]);

const traveling = (params?: { head: Coord; tail: Coord }) => (steps: Array<[string, number]>) => {
  let { head = { x: 0, y: 0 }, tail = { x: 0, y: 0 } } = params || {};
  const visitedSet = new Set([convertCoordString(tail)]);

  steps.forEach(([dir, num]) => {
    times(() => {
      head = pipe(getMoveCoord(dir), addCoord(head));

      const td = pipe(subtractCoord(tail, head), getDirectionCoord);

      tail = addCoord(head, td);
      visitedSet.add(convertCoordString(tail));
    }, num);
  });

  return visitedSet;
};

const getFollowDirectionCoord = cond<[Coord], Coord>([
  [whereEq({ x: 2, y: 2 }), always(directions.UR)],
  [whereEq({ x: 2, y: -2 }), always(directions.DR)],
  [whereEq({ x: -2, y: 2 }), always(directions.UL)],
  [whereEq({ x: -2, y: -2 }), always(directions.DL)],

  [whereEq({ x: -2 }), always(directions.L)],
  [whereEq({ x: 2 }), always(directions.R)],
  [whereEq({ y: -2 }), always(directions.D)],
  [whereEq({ y: 2 }), always(directions.U)],
  [T, identity],
]);

const traveling2 =
  (params?: { head: Coord; tails: Coord[] }) => (steps: Array<[string, number]>) => {
    let head = params?.head || { x: 0, y: 0 };
    let tails = params?.tails || times(() => ({ x: 0, y: 0 }), 9);
    const visitedSet = new Set([convertCoordString(head)]);

    steps.forEach(([dir, num]) => {
      times(() => {
        head = pipe(getMoveCoord(dir), addCoord(head));

        const lastCoord = tails.reduce(
          (prev, coord, index, origin) =>
            pipe<Coord, Coord, Coord, Coord>(
              subtractCoord(coord, prev),
              getFollowDirectionCoord,
              addCoord(prev),
              tap((coord) => {
                origin[index] = coord;
              })
            ),
          head
        );

        visitedSet.add(convertCoordString(lastCoord));
      }, num);
    });

    return visitedSet;
  };

const part1Flow = flow(sliceContent, A.map(parseMoveStr), traveling(), prop('size'));

const part2Flow = flow(sliceContent, A.map(parseMoveStr), traveling2(), prop('size'));

pipe(
  getDataContent('./day-9/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some err', err),
    (res) => console.log('part 1 answer is', res)
  )
)();

pipe(
  getDataContent('./day-9/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some err', err),
    (res) => console.log('part 2 answer is', res)
  )
)();
