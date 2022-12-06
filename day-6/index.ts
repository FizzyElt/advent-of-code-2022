import * as TE from 'fp-ts/TaskEither';
import { pipe, flow } from 'fp-ts/function';

import { uniq, slice, equals, trim, tap } from 'ramda';

import { getDataContent } from '../utils/readFileTask';

const sliceContent = flow(trim);

const findFirstMarker = (checkNumOfChar: number) => (str: string) => {
  return [...str].findIndex((_c, index, chars) => {
    const uniqChar = pipe(
      chars,
      slice(Math.max(0, index - checkNumOfChar), index) as (arr: string[]) => string[],
      uniq
    );
    return equals(uniqChar.length, checkNumOfChar);
  });
};

const part1Flow = flow(sliceContent, findFirstMarker(4));

const part2Flow = flow(sliceContent, findFirstMarker(14));

pipe(
  getDataContent('./day-6/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();

pipe(
  getDataContent('./day-6/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();
