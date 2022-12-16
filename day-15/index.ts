import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';

import { tap, filter, uniqBy } from 'ramda';

import { data, testData } from './data';

export type Position = [number, number];

const getPositionDistance = (a: Position, b: Position) => {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
};

const calcSensorRange = ({
  sensor,
  beacon,
}: {
  sensor: Position;
  beacon: Position;
}): { sensor: Position; beacon: Position; scope: number } => ({
  sensor,
  beacon,
  scope: getPositionDistance(sensor, beacon),
});

const isScopedCoverInY =
  (y: number) => (data: { sensor: Position; beacon: Position; scope: number }) => {
    const sensorY = data.sensor[1];

    return Math.abs(y - sensorY) <= data.scope;
  };

const findXRange = (data: Array<{ sensor: Position; beacon: Position; scope: number }>) => {
  return data.reduce(
    (acc, item) => {
      if (item.sensor[0] + item.scope > acc.maxX) {
        acc.maxX = item.sensor[0] + item.scope;
      }
      if (item.sensor[0] - item.scope < acc.minX) {
        acc.minX = item.sensor[0] - item.scope;
      }
      return acc;
    },
    { minX: Infinity, maxX: -Infinity }
  );
};

const getMergedRange = (params: {
  data: Array<{ sensor: Position; beacon: Position; scope: number }>;
  y: number;
}) => {
  const { data, y } = params;
  return data
    .reduce<Array<{ start: number; end: number }>>((acc, item) => {
      const { sensor, scope } = item;
      const [sensorX, sensorY] = sensor;

      const distance = Math.abs(y - sensorY);

      if (distance <= scope) {
        const range = {
          start: sensorX - (scope - distance),
          end: sensorX + (scope - distance),
        };
        acc.push(range);
      }
      return acc;
    }, [])
    .sort((a, b) => a.start - b.start)
    .reduce<Array<{ start: number; end: number }>>((acc, range) => {
      const prevRange = acc.pop();
      if (!prevRange) {
        acc.push(range);
        return acc;
      }

      if (prevRange.end >= range.start - 1) {
        acc.push({
          start: Math.min(range.start, prevRange.start),
          end: Math.max(range.end, prevRange.end),
        });
        return acc;
      }
      acc.push(prevRange, range);
      return acc;
    }, []);
};

const getOverlapCount = (params: {
  data: Array<{ sensor: Position; beacon: Position; scope: number }>;
  range: { minX: number; maxX: number };
  y: number;
}) => {
  const { data, y } = params;

  const mergeRanges = getMergedRange({ data, y });

  return (
    mergeRanges.reduce((acc, range) => acc + (range.end - range.start + 1), 0) -
    uniqBy(
      ({ beacon }) => {
        beacon[0];
      },
      data.filter(({ beacon }) => beacon[1] === y)
    ).length
  );
};

const part1Flow = flow(A.map(calcSensorRange), filter(isScopedCoverInY(2000000)), (data) => {
  const range = findXRange(data);
  return getOverlapCount({ data, range, y: 2000000 });
});

const scanIsolatePosition = (
  data: Array<{ sensor: Position; beacon: Position; scope: number }>
) => {
  const M = 4000000;

  for (let i = 1; i <= M; i++) {
    const mergeRanges = getMergedRange({ data, y: i });

    let x = 0;
    for (const range of mergeRanges) {
      if (x < range.start) {
        return x * M + i;
      }
      x = Math.max(x, range.end + 1);
      if (x > M) break;
    }
  }
  return 0;
};

const part2Flow = flow(A.map(calcSensorRange), scanIsolatePosition);

pipe(
  data,
  part2Flow,
  tap((data) => console.log(data))
);
