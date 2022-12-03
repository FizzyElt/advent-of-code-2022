import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import { flow, pipe } from 'fp-ts/function';

import { getDataContent } from '../utils/readFileTask';

import { reduce, split, trim, sum, splitAt, intersection, uniq, equals } from 'ramda';

const sliceContent = flow(trim, split('\n'));

const getPriorityCode = (char: string) => {
  const charCode = char.charCodeAt(0);
  if (/[a-z]/.test(char)) return charCode - 'a'.charCodeAt(0) + 1;
  return charCode - 'A'.charCodeAt(0) + 27;
};

const findTheCommonChars = A.reduce<string, Array<string>>([], (acc, str) =>
  equals(acc.length, 0) ? uniq([...str]) : intersection(acc, uniq([...str]))
);

const part1Flow = flow(
  sliceContent,
  A.map((str) => splitAt(Math.floor(str.length / 2), str)),
  A.chain(findTheCommonChars),
  A.map(getPriorityCode),
  sum
);

const part2Flow = flow(
  sliceContent,
  A.chunksOf(3),
  A.chain(findTheCommonChars),
  A.map(getPriorityCode),
  sum
);

pipe(
  getDataContent('./day-3/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();

pipe(
  getDataContent('./day-3/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();
