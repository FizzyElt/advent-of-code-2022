import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';
import { getDataContent } from '../utils/readFileTask';

import { split, trim, fromPairs, times, join, splitAt, clone } from 'ramda';

type MoveInfo = {
  move: number;
  from: number;
  to: number;
};

/**
[P]     [L]         [T]            
[L]     [M] [G]     [G]     [S]    
[M]     [Q] [W]     [H] [R] [G]    
[N]     [F] [M]     [D] [V] [R] [N]
[W]     [G] [Q] [P] [J] [F] [M] [C]
[V] [H] [B] [F] [H] [M] [B] [H] [B]
[B] [Q] [D] [T] [T] [B] [N] [L] [D]
[H] [M] [N] [Z] [M] [C] [M] [P] [P]
 1   2   3   4   5   6   7   8   9 
 */
const stacks: string[][] = [
  ['H', 'B', 'V', 'W', 'N', 'M', 'L', 'P'],
  ['M', 'Q', 'H'],
  ['N', 'D', 'B', 'G', 'F', 'Q', 'M', 'L'],
  ['Z', 'T', 'F', 'Q', 'M', 'W', 'G'],
  ['M', 'T', 'H', 'P'],
  ['C', 'B', 'M', 'J', 'D', 'H', 'G', 'T'],
  ['M', 'N', 'B', 'F', 'V', 'R'],
  ['P', 'L', 'H', 'M', 'R', 'G', 'S'],
  ['P', 'D', 'B', 'C', 'N'],
];

const spliceContent = flow(trim, split('\n'));

const parseStep = flow(
  split(' '),
  A.chunksOf(2),
  A.map(([key, value]) => [key, parseInt(value)] as [string, number]),
  fromPairs
) as (str: string) => MoveInfo;

const moveItem = (moveInfo: MoveInfo) => (stacks: string[][]) => {
  const move = moveInfo.move;
  const from = moveInfo.from - 1;
  const to = moveInfo.to - 1;

  const [front, tail] = splitAt(-1 * move, stacks[from]);

  stacks[from] = front;
  stacks[to] = stacks[to].concat(tail.reverse());

  return stacks;
};

const moveItem2 = (moveInfo: MoveInfo) => (stacks: string[][]) => {
  const move = moveInfo.move;
  const from = moveInfo.from - 1;
  const to = moveInfo.to - 1;

  const [front, tail] = splitAt(-1 * move, stacks[from]);

  stacks[from] = front;
  stacks[to] = stacks[to].concat(tail);

  return stacks;
};

const part1Flow = flow(
  spliceContent,
  A.map(parseStep),
  A.map(moveItem),
  A.reduce(clone(stacks), (acc, move) => move(acc)),
  A.map((stack) => stack.at(-1) || ' '),
  join('')
);

const part2Flow = flow(
  spliceContent,
  A.map(parseStep),
  A.map(moveItem2),
  A.reduce(clone(stacks), (acc, move) => move(acc)),
  A.map((stack) => stack.at(-1) || ' '),
  join('')
);

pipe(
  getDataContent('./day-5/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();

pipe(
  getDataContent('./day-5/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();
