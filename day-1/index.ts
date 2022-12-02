import * as fs from 'fs/promises';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { flow, pipe } from 'fp-ts/function';

import {
  sum,
  split,
  trim,
  sort,
  slice,
  reduce,
  cond,
  T,
  equals,
  ifElse,
  append,
  gte,
  propEq,
  take,
} from 'ramda';

const getDataContent = (filePath: string): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    () => fs.readFile(filePath, 'utf8'),
    (err) => new Error(`${err}`)
  );

const sliceContent = flow(split('\n\n'), A.map(flow(trim, split('\n'))));

const parseArrayStrToNum = A.map(parseInt);

const parse2DArrayStrToNum = A.map(parseArrayStrToNum);

const maxOfNumArray = (list: Array<number>) => Math.max(...list);

const getFirstFewMaxElements = (top: number) =>
  reduce<number, Array<number>>(
    (acc, num) =>
      ifElse<[Array<number>], Array<number>, Array<number>>(
        propEq('length', 0),
        () => A.of(num),

        flow(
          reduce<number, Array<number>>(
            (acc, item) => acc.concat(gte(num, item) ? [num, item] : [item]),
            []
          ),
          take<number>(top)
        )
      )(acc),
    []
  );

const part1Flow = flow(sliceContent, parse2DArrayStrToNum, A.map(sum), maxOfNumArray);

const part2Flow = flow(sliceContent, parse2DArrayStrToNum, A.map(sum), getFirstFewMaxElements(3));

// part 1
pipe(
  getDataContent('./day-1/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();

// part 2
pipe(
  getDataContent('./day-1/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();
