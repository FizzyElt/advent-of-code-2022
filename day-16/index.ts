import { tuple } from 'fp-ts/function';
import { keys } from 'ramda';

import { testData, data } from './data';

function part1NewVersion(data: Array<{ name: string; rate: number; valves: Array<string> }>) {
  const { valves, tunnels } = data.reduce<{
    valves: Record<string, number>;
    tunnels: Record<string, string[]>;
  }>(
    (acc, item) => {
      acc.valves[item.name] = item.rate;
      acc.tunnels[item.name] = item.valves;
      return acc;
    },
    { valves: {}, tunnels: {} }
  );

  const dists: Record<string, Record<string, number>> = {};
  const nonempty = [];

  for (const valve of keys(valves)) {
    if (valve !== 'AA' && !valves[valve]) {
      continue;
    }

    if (valve !== 'AA') {
      nonempty.push(valve);
    }

    dists[valve] = { [valve]: 0, AA: 0 };

    const visited = new Set([valve]);

    const queue = [tuple(0, valve)];

    while (queue.length > 0) {
      const [distance = 0, position = ''] = queue.shift() || [];

      tunnels[position].forEach((neighbor) => {
        if (visited.has(neighbor)) return;

        visited.add(neighbor);

        if (valves[neighbor]) {
          dists[valve][neighbor] = distance + 1;
        }
        queue.push(tuple(distance + 1, neighbor));
      });
    }

    delete dists[valve][valve];
    if (valve !== 'AA') delete dists[valve]['AA'];
  }

  const indices = nonempty.reduce<Record<string, number>>((acc, valve, index) => {
    acc[valve] = index;
    return acc;
  }, {});

  const cache: Record<string, number> = {};

  function dfs(time: number, valve: string, bitmask: number) {
    if (cache[`${time},${valve},${bitmask}`]) {
      return cache[`${time},${valve},${bitmask}`];
    }

    let maxval: number = 0;

    keys(dists[valve]).forEach((neighbor) => {
      const bit = 1 << indices[neighbor];
      if (bitmask & bit) return;
      const remainTime = time - dists[valve][neighbor] - 1;

      if (remainTime <= 0) return;
      maxval = Math.max(
        maxval,
        dfs(remainTime, neighbor, bitmask | bit) + valves[neighbor] * remainTime
      );
    });

    cache[`${time},${valve},${bitmask}`] = maxval as never;
    return maxval;
  }

  return dfs(30, 'AA', 0);
}

function part2NewVersion(data: Array<{ name: string; rate: number; valves: Array<string> }>) {
  const { valves, tunnels } = data.reduce<{
    valves: Record<string, number>;
    tunnels: Record<string, string[]>;
  }>(
    (acc, item) => {
      acc.valves[item.name] = item.rate;
      acc.tunnels[item.name] = item.valves;
      return acc;
    },
    { valves: {}, tunnels: {} }
  );

  const dists: Record<string, Record<string, number>> = {};
  const nonempty = [];

  for (const valve of keys(valves)) {
    if (valve !== 'AA' && !valves[valve]) {
      continue;
    }

    if (valve !== 'AA') {
      nonempty.push(valve);
    }

    dists[valve] = { [valve]: 0, AA: 0 };

    const visited = new Set([valve]);

    const queue = [tuple(0, valve)];

    while (queue.length > 0) {
      const [distance = 0, position = ''] = queue.shift() || [];

      tunnels[position].forEach((neighbor) => {
        if (visited.has(neighbor)) return;

        visited.add(neighbor);

        if (valves[neighbor]) {
          dists[valve][neighbor] = distance + 1;
        }
        queue.push(tuple(distance + 1, neighbor));
      });
    }

    delete dists[valve][valve];
    if (valve !== 'AA') delete dists[valve]['AA'];
  }

  const indices = nonempty.reduce<Record<string, number>>((acc, valve, index) => {
    acc[valve] = index;
    return acc;
  }, {});

  const cache: Record<string, number> = {};

  function dfs(time: number, valve: string, bitmask: number) {
    if (cache[`${time},${valve},${bitmask}`]) {
      return cache[`${time},${valve},${bitmask}`];
    }

    let maxval: number = 0;

    keys(dists[valve]).forEach((neighbor) => {
      const bit = 1 << indices[neighbor];
      if (bitmask & bit) return;
      const remainTime = time - dists[valve][neighbor] - 1;

      if (remainTime <= 0) return;
      maxval = Math.max(
        maxval,
        dfs(remainTime, neighbor, bitmask | bit) + valves[neighbor] * remainTime
      );
    });

    cache[`${time},${valve},${bitmask}`] = maxval as never;
    return maxval;
  }

  let b = (1 << nonempty.length) - 1;

  let max = 0;

  for (let i = 0; i < Math.floor((b + 1) / 2); i++) {
    max = Math.max(max, dfs(26, 'AA', i) + dfs(26, 'AA', b ^ i));
  }

  return max;
}

console.log(part2NewVersion(data));
