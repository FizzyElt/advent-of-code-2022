import * as fs from 'fs/promises';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { flow, pipe } from 'fp-ts/function';

import { sum, split, trim } from 'ramda';

const getDataContent = (filePath: string): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    () => fs.readFile(filePath, 'utf8'),
    (err) => new Error(`${err}`)
  );

const sliceContent = flow(split('\n\n'), A.map(flow(trim, split('\n'))));

const parseArrayStrToNum = A.map(parseInt);

const maxOfNumArray = (list: Array<number>) => Math.max(...list);

pipe(
  getDataContent('./day-1/data.txt'),
  TE.map(sliceContent),
  TE.map(A.map(flow(parseArrayStrToNum, sum))),
  TE.map(maxOfNumArray),
  TE.match(
    (err) => console.log('use got some error', err),
    (res) => console.log('answer is', res)
  )
)();
