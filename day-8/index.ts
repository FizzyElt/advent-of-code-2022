import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';

import { split, splitAt, or, prop, trim, any, gt, __, all, tail } from 'ramda';

import { getDataContent } from '../utils/readFileTask';

const sliceContent = flow(trim, split('\n'), A.map(split('')));

const parse2DArrayStrToNum = A.map(A.map(parseInt));

const findMaxNumber = (arr: number[]) => Math.max(...arr);

const isTreeVisible =
  (grid: number[][]) =>
  ({ x, y }: { x: number; y: number }) => {
    const tree = grid.at(x)?.at(y) || 0;

    const row = getGridRow(grid, x);
    const col = getGriColumn(grid, y);
    const [left, right] = splitAt(x, row);
    const [top, bottom] = splitAt(y, col);

    const isAllLessThanTree = all(gt(tree));

    return pipe(
      false,
      or(isAllLessThanTree(left)),
      or(isAllLessThanTree(tail(right))),
      or(isAllLessThanTree(top)),
      or(isAllLessThanTree(tail(bottom)))
    );
  };

const getGridRow = (grid: number[][], rowIndex: number) => grid.at(rowIndex) || [];

const getGriColumn = (grid: number[][], columnIndex: number) =>
  grid.map((row) => row.at(columnIndex) || 0);

const part1Flow = flow(sliceContent, parse2DArrayStrToNum, (grid) => {
  const isTargetTreeVisible = isTreeVisible(grid);
  return grid.map((row, i) => row.map((_, j) => isTargetTreeVisible({ x: i, y: j })));
});

pipe(
  getDataContent('./day-8/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error: ' + err),
    (res) => console.log(res)
  )
)();
