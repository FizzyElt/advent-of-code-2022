import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';

import {
  split,
  trim,
  reduce,
  equals,
  cond,
  gte,
  T,
  always,
  sum,
  assoc,
  times,
  join,
  prop,
  modify,
  inc,
  add,
  mergeRight,
} from 'ramda';

import { getDataContent } from '../utils/readFileTask';

const sliceContent = flow(trim, split('\n'));

const cycleOperation = (params: { x: number; signal: [string, number] }) => {
  const { x, signal } = params;
  const [, num] = signal;
  return pipe(params, assoc('x', x + num));
};

const newProcess = reduce<
  [string, number],
  { x: number; cycle: number; checkCycle: number; strengths: number[] }
>(
  (acc, signal) => {
    if (acc.cycle === acc.checkCycle) {
      acc.strengths.push(acc.checkCycle * acc.x);
      acc.checkCycle += 40;
    }

    const { x } = cycleOperation({
      signal,
      x: acc.x,
    });

    return pipe(acc, assoc('x', x), modify('cycle', inc));
  },
  {
    x: 1,
    checkCycle: 20,
    cycle: 1,
    strengths: [],
  }
);

const cycleOperation2 = (params: {
  x: number;
  signal: [string, number];
  cycle: number;
  linePixels: string[];
}) => {
  const { x, cycle, signal, linePixels } = params;
  const drawPosition = cycle % 40;
  const [, num] = signal;

  const newLinePixels =
    drawPosition < x + 3 && drawPosition >= x ? assoc(drawPosition, '#', linePixels) : linePixels;

  return pipe(params, modify('x', add(num)), assoc('linePixels', newLinePixels));
};

const process2 = reduce<
  [string, number],
  { cycle: number; linePixels: string[]; totalPixels: string[][]; x: number }
>(
  (acc, signal) => {
    if (acc.cycle % 40 === 0 && acc.cycle / 40 > 0) acc.totalPixels.push(acc.linePixels);

    const { x, linePixels } = cycleOperation2({
      x: acc.x,
      signal,
      cycle: acc.cycle,
      linePixels: acc.cycle % 40 === 0 ? times(always('.'), 40) : acc.linePixels,
    });

    return pipe(acc, assoc('x', x), modify('cycle', inc), assoc('linePixels', linePixels));
  },
  {
    cycle: 0,
    linePixels: times(always('.'), 40),
    totalPixels: [],
    x: 0,
  }
);

const splitSignals = A.chain<string, [string, number]>(
  flow(split(' '), ([opt, num = '0']) =>
    cond<[string], [string, number][]>([
      [equals('noop'), (opt) => [[opt, parseInt(num)]]],
      [
        equals('addx'),
        (opt) => [
          [opt, 0],
          [opt, parseInt(num)],
        ],
      ],
    ])(opt)
  )
);

//const part1Flow = flow(sliceContent, process({ start: 20, interval: 40, x: 1 }));
const part1Flow = flow(sliceContent, splitSignals, newProcess, prop('strengths'), sum);
const part2Flow = flow(
  sliceContent,
  splitSignals,
  process2,
  ({ totalPixels, linePixels }) => [...totalPixels, linePixels],
  A.map(join('')),
  join('\n')
);

pipe(
  getDataContent('./day-10/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('part 1 answer is', res)
  )
)();

pipe(
  getDataContent('./day-10/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log(res)
  )
)();
