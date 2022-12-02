import * as fs from 'fs/promises';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { flow, pipe } from 'fp-ts/function';

import { cond, equals, always, where, split, trim, sum } from 'ramda';

type RPS = 'Rock' | 'Paper' | 'Scissors';

const getDataContent = (filePath: string): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    () => fs.readFile(filePath, 'utf8'),
    (err) => new Error(`${err}`)
  );

const formatRPS = (value: string): 'Rock' | 'Paper' | 'Scissors' => {
  if (equals(value, 'A') || equals(value, 'X')) return 'Rock';
  if (equals(value, 'B') || equals(value, 'Y')) return 'Paper';
  if (equals(value, 'C') || equals(value, 'Z')) return 'Scissors';
  throw Error('not match string');
};

const sliceContent = flow(
  trim,
  split('\n'),
  A.map(split(' ')),
  A.map(([left, right]) => [formatRPS(left), formatRPS(right)])
);

const isRock = equals('Rock');
const isPaper = equals('Paper');
const isScissors = equals('Scissors');

const getRightPlayerScore = ([left, right]: [RPS, RPS]): number => {
  const lose = always(0);
  const draw = always(3);
  const win = always(6);

  return cond([
    [where({ left: isRock, right: isRock }), draw],
    [where({ left: isRock, right: isPaper }), win],
    [where({ left: isRock, right: isScissors }), lose],

    [where({ left: isPaper, right: isRock }), lose],
    [where({ left: isPaper, right: isPaper }), draw],
    [where({ left: isPaper, right: isScissors }), win],

    [where({ left: isScissors, right: isRock }), win],
    [where({ left: isScissors, right: isPaper }), lose],
    [where({ left: isScissors, right: isScissors }), draw],
  ])({ left, right });
};

const getTypeScore = cond<[RPS], number>([
  [isRock, always(1)],
  [isPaper, always(2)],
  [isScissors, always(3)],
]);

const part1Flow = flow(
  sliceContent,
  A.map(([left, right]) => getRightPlayerScore([left, right]) + getTypeScore(right)),
  sum
);

pipe(
  getDataContent('./day-2/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();
