import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import { pipe, flow } from 'fp-ts/function';
import { getDataContent } from '../utils/readFileTask';

import { trim, split, equals, sum, sortBy, prop } from 'ramda';

type Pair<T> = [T, T];

const sliceContent = flow(trim, split('\n'));

// 1-2,3-4 -> [1-2, 3-4] -> [[1, 2], [2, 4]]
const formatItem = flow(split(','), A.map(flow(split('-'), A.map(parseInt)))) as (
  str: string
) => Pair<Pair<number>>;

const isFullyContains = ([left, right]: Pair<Pair<number>>) => {
  const [leftStart, leftEnd] = left;
  const [rightStart, rightEnd] = right;

  const minStart = Math.min(leftStart, rightStart);
  const maxEnd = Math.max(leftEnd, rightEnd);

  if (equals(minStart, leftStart) && equals(maxEnd, leftEnd)) return true;
  if (equals(minStart, rightStart) && equals(maxEnd, rightEnd)) return true;
  return false;
};

// 必須先對起始做排序才能確保重疊判斷是對的
const isOverlap = flow(sortBy(prop(0)), ([left, right]) => {
  const [, leftEnd] = left;
  const [rightStart] = right;
  return leftEnd >= rightStart;
}) as (pair: Pair<Pair<number>>) => boolean;

const part1Flow = flow(
  sliceContent,
  A.map(formatItem),
  A.map(isFullyContains),
  A.map((bool) => (bool ? 1 : 0)),
  sum
);

const part2Flow = flow(
  sliceContent,
  A.map(formatItem),
  A.map(isOverlap),
  A.map((bool) => (bool ? 1 : 0)),
  sum
);

pipe(
  getDataContent('./day-4/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();

pipe(
  getDataContent('./day-4/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();
