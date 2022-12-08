import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';

import {
  split,
  splitAt,
  prop,
  trim,
  any,
  gt,
  gte,
  __,
  all,
  tail,
  reverse,
  findIndex,
  equals,
} from 'ramda';

import { getDataContent } from '../utils/readFileTask';

const sliceContent = flow(trim, split('\n'), A.map(split('')));

const parse2DArrayStrToNum = A.map(A.map(parseInt));

const getDirectionsList =
  (grid: number[][]) =>
  ({ x, y }: { x: number; y: number }): number[][] => {
    const row = getGridRow(grid, x);
    const col = getGriColumn(grid, y);
    const [left, right] = splitAt(y, row);
    const [top, bottom] = splitAt(x, col);

    return [reverse(left), tail(right), reverse(top), tail(bottom)];
  };

const isTreeVisible =
  (high: number) =>
  (directions: number[][]): boolean => {
    const isAllLessThanHigh = all(gt(high));
    return any(isAllLessThanHigh, directions);
  };

const getTreeViewScore =
  (high: number) =>
  (directions: number[][]): number => {
    const findHigherTreeIndex = findIndex(gte(__, high));
    return directions.filter(flow(prop('length'), gt(__, 0))).reduce((acc, direction) => {
      const index = findHigherTreeIndex(direction);
      if (equals(index, -1)) return acc * direction.length;
      return acc * (index + 1);
    }, 1);
  };

const getGridRow = (grid: number[][], rowIndex: number): number[] => grid.at(rowIndex) || [];

const getGriColumn = (grid: number[][], columnIndex: number): number[] =>
  grid.map((row) => row.at(columnIndex) || 0);

const part1Flow = flow(
  sliceContent,
  parse2DArrayStrToNum,
  (grid) => {
    const getTargetDirectionsList = getDirectionsList(grid);
    return grid.flatMap((row, i) =>
      row.filter((tree, j) => pipe(getTargetDirectionsList({ x: i, y: j }), isTreeVisible(tree)))
    );
  },
  prop('length')
);

const part2Flow = flow(
  sliceContent,
  parse2DArrayStrToNum,
  (grid) => {
    const getTargetDirectionsList = getDirectionsList(grid);
    return grid.flatMap((row, i) =>
      row.map((tree, j) => pipe(getTargetDirectionsList({ x: i, y: j }), getTreeViewScore(tree)))
    );
  },
  (arr) => Math.max(...arr)
);

pipe(
  getDataContent('./day-8/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error: ' + err),
    (res) => console.log('part 1 answer is', res)
  )
)();

pipe(
  getDataContent('./day-8/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error: ' + err),
    (res) => console.log('part 2 answer is', res)
  )
)();
