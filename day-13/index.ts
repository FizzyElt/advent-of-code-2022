import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';

import { is, isNil, sort, reduce, trim, split, prop } from 'ramda';
import { getDataContent } from '../utils/readFileTask';

type RecursionArray = Array<RecursionArray> | number;

type CompareResult = 'left' | 'equal' | 'right';

const isNumber = is(Number);

const sliceContent = flow(trim, split('\n\n'), A.chain(split('\n')));

function compare(left: RecursionArray, right: RecursionArray): CompareResult {
  if (isNumber(left) && isNumber(right)) {
    return left === right ? 'equal' : left < right ? 'right' : 'left';
  }

  const newLeft = isNumber(left) ? [left] : left;
  const newRight = isNumber(right) ? [right] : right;

  const maxLength = Math.max(newLeft.length, newRight.length);

  for (let i = 0; i < maxLength; i++) {
    const leftElement = newLeft.at(i);
    const rightElement = newRight.at(i);

    if (isNil(leftElement)) return 'right';
    if (isNil(rightElement)) return 'left';

    const result = compare(leftElement, rightElement);
    if (result === 'equal') continue;

    return result;
  }

  return 'equal';
}

const part1Flow = flow(
  sliceContent,
  A.map(JSON.parse),
  A.chunksOf(2) as (arr: Array<RecursionArray>) => Array<[RecursionArray, RecursionArray]>,
  reduce<[RecursionArray, RecursionArray], { sum: number; index: number }>(
    (acc, pair) => {
      const [left, right] = pair;
      const status = compare(left, right);
      if (status === 'right') acc.sum += acc.index + 1;
      acc.index += 1;
      return acc;
    },
    {
      sum: 0,
      index: 0,
    }
  ),
  prop('sum')
);

const part2Flow = flow(
  sliceContent,
  A.map(JSON.parse) as (arr: string[]) => Array<RecursionArray>,
  sort((a, b) => {
    const res = compare(a, b);
    if (res === 'equal') return 0;
    if (res === 'left') return 1;
    return -1;
  }),
  (sortedPackets) => {
    const insertPacketIndex = sortedPackets.findIndex((arr) => compare([[2]], arr) === 'right');
    const insertPacketIndex2 = sortedPackets.findIndex((arr) => compare([[6]], arr) === 'right');
    return (insertPacketIndex + 1) * (insertPacketIndex2 + 2);
  }
);

pipe(
  getDataContent('./day-13/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('part 1 answer is', res)
  )
)();

pipe(
  getDataContent('./day-13/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('part 2 answer is', res)
  )
)();
