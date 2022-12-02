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

const rock = always<RPS>('Rock');
const paper = always<RPS>('Paper');
const scissors = always<RPS>('Scissors');

const isWin = equals('Win');
const isLose = equals('Lose');
const isDraw = equals('Draw');

const win = always<GameStatus>('Win');
const lose = always<GameStatus>('Lose');
const draw = always<GameStatus>('Draw');

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

const getRightPlayerOutcome = ([left, right]: [RPS, RPS]): GameStatus =>
  cond([
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

const getPlayerRPS = (rps: RPS, res: GameStatus): RPS =>
  cond<[{ rps: RPS; res: GameStatus }], RPS>([
    [where({ rps: isRock, res: isWin }), paper],
    [where({ rps: isRock, res: isLose }), scissors],
    [where({ rps: isRock, res: isDraw }), rock],

    [where({ rps: isPaper, res: isWin }), scissors],
    [where({ rps: isPaper, res: isLose }), rock],
    [where({ rps: isPaper, res: isDraw }), paper],

    [where({ rps: isScissors, res: isWin }), rock],
    [where({ rps: isScissors, res: isLose }), paper],
    [where({ rps: isScissors, res: isDraw }), scissors],
  ])({ rps, res });

const part1Flow = flow(
  sliceContent,
  A.map(([left, right]) => [formatRPS(left), formatRPS(right)]),
  A.map(
    ([left, right]) => getGameScore(getRightPlayerOutcome([left, right])) + getTypeScore(right)
  ),
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
