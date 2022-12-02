import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { flow, pipe } from 'fp-ts/function';
import { getDataContent } from '../utils/readFileTask';

import { cond, equals, always, where, split, trim, sum } from 'ramda';

type RPS = 'Rock' | 'Paper' | 'Scissors';
type GameStatus = 'Win' | 'Lose' | 'Draw';

const formatRPS = (value: string): RPS => {
  if (equals(value, 'A') || equals(value, 'X')) return 'Rock';
  if (equals(value, 'B') || equals(value, 'Y')) return 'Paper';
  if (equals(value, 'C') || equals(value, 'Z')) return 'Scissors';
  throw Error('not match string');
};

const formatGameResult = (value: string): GameStatus => {
  if (equals(value, 'X')) return 'Lose';
  if (equals(value, 'Y')) return 'Draw';
  if (equals(value, 'Z')) return 'Win';
  throw Error('not match string');
};

const sliceContent = flow(trim, split('\n'), A.map(split(' ')));

const isRock = equals('Rock');
const isPaper = equals('Paper');
const isScissors = equals('Scissors');

const isWin = equals('Win');
const isLose = equals('Lose');
const isDraw = equals('Draw');

const getGameScore = cond<[GameStatus], number>([
  [isWin, always(6)],
  [isLose, always(0)],
  [isDraw, always(3)],
]);

const getTypeScore = cond<[RPS], number>([
  [isRock, always(1)],
  [isPaper, always(2)],
  [isScissors, always(3)],
]);

const getRightPlayerScore = ([left, right]: [RPS, RPS]): number => {
  const lose = always(getGameScore('Win'));
  const draw = always(getGameScore('Draw'));
  const win = always(getGameScore('Lose'));

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

const getPlayerRPS = (rps: RPS, res: GameStatus): RPS => {
  return cond<[{ rps: RPS; res: GameStatus }], RPS>([
    [where({ rps: isRock, res: isWin }), always('Paper')],
    [where({ rps: isRock, res: isLose }), always('Scissors')],
    [where({ rps: isRock, res: isDraw }), always('Rock')],

    [where({ rps: isPaper, res: isWin }), always('Scissors')],
    [where({ rps: isPaper, res: isLose }), always('Rock')],
    [where({ rps: isPaper, res: isDraw }), always('Paper')],

    [where({ rps: isScissors, res: isWin }), always('Rock')],
    [where({ rps: isScissors, res: isLose }), always('Paper')],
    [where({ rps: isScissors, res: isDraw }), always('Scissors')],
  ])({ rps, res });
};

const part1Flow = flow(
  sliceContent,
  A.map(([left, right]) => [formatRPS(left), formatRPS(right)]),
  A.map(([left, right]) => getRightPlayerScore([left, right]) + getTypeScore(right)),
  sum
);

const part2Flow = flow(
  sliceContent,
  A.map<Array<string>, [RPS, GameStatus]>(([left, right]) => [
    formatRPS(left),
    formatGameResult(right),
  ]),
  A.map(
    ([opponentRPS, result]) =>
      getGameScore(result) + getTypeScore(getPlayerRPS(opponentRPS, result))
  ),
  sum
);

// part 1
pipe(
  getDataContent('./day-2/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();

// part 2
pipe(
  getDataContent('./day-2/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();
