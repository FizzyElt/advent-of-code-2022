import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';

import { identity, tap, times, prop, sort, take, reduce, multiply } from 'ramda';

type Monkey = {
  items: number[];
  operation: (v: number) => number;
  division: number;
  right: number;
  left: number;
  inspectedItems: number;
};

const testMonkeys: Monkey[] = [
  {
    items: [79, 98],
    operation: (v: number) => v * 19,
    division: 23,
    right: 2,
    left: 3,
    inspectedItems: 0,
  },
  {
    items: [54, 65, 75, 74],
    operation: (v: number) => v + 6,
    division: 19,
    right: 2,
    left: 0,
    inspectedItems: 0,
  },
  {
    items: [79, 60, 97],
    operation: (v: number) => v * v,
    division: 13,
    right: 1,
    left: 3,
    inspectedItems: 0,
  },
  {
    items: [74],
    operation: (v: number) => v + 3,
    division: 17,
    right: 0,
    left: 1,
    inspectedItems: 0,
  },
];

const monkeys: Monkey[] = [
  {
    items: [89, 73, 66, 57, 64, 80],
    operation: (v: number) => v * 3,
    division: 13,
    right: 6,
    left: 2,
    inspectedItems: 0,
  },
  {
    items: [83, 78, 81, 55, 81, 59, 69],
    operation: (v: number) => v + 1,
    division: 3,
    right: 7,
    left: 4,
    inspectedItems: 0,
  },
  {
    items: [76, 91, 58, 85],
    operation: (v: number) => v * 13,
    division: 7,
    right: 1,
    left: 4,
    inspectedItems: 0,
  },
  {
    items: [71, 72, 74, 76, 68],
    operation: (v: number) => v * v,
    division: 2,
    right: 6,
    left: 0,
    inspectedItems: 0,
  },
  {
    items: [98, 85, 84],
    operation: (v: number) => v + 7,
    division: 19,
    right: 5,
    left: 7,
    inspectedItems: 0,
  },
  {
    items: [78],
    operation: (v: number) => v + 8,
    division: 5,
    right: 3,
    left: 0,
    inspectedItems: 0,
  },
  {
    items: [86, 70, 60, 88, 88, 78, 74, 83],
    operation: (v: number) => v + 4,
    division: 11,
    right: 1,
    left: 2,
    inspectedItems: 0,
  },
  {
    items: [81, 58],
    operation: (v: number) => v + 5,
    division: 17,
    right: 3,
    left: 5,
    inspectedItems: 0,
  },
];

const multiplyArr = reduce<number, number>(multiply, 1);

const monkeysProcessRound = (monkeys: Monkey[]): Monkey[] => {
  monkeys.forEach((monkey, index, monkeys) => {
    monkey.items.forEach((item) => {
      const workLevel = Math.floor(monkey.operation(item) / 3);
      if (workLevel % monkey.division === 0) {
        return monkeys.at(monkey.right)?.items.push(workLevel);
      }
      return monkeys.at(monkey.left)?.items.push(workLevel);
    });
    monkeys[index].inspectedItems += monkey.items.length;
    monkeys[index].items = [];
  });

  return monkeys;
};

const monkeysProcessRound2 = (monkeys: Monkey[]): Monkey[] => {
  const lcm = multiplyArr(monkeys.map(prop('division')));
  monkeys.forEach((monkey, index, monkeys) => {
    monkey.items.forEach((item) => {
      const workLevel = monkey.operation(item) % lcm;
      if (workLevel % monkey.division === 0) {
        return monkeys.at(monkey.right)?.items.push(workLevel);
      }
      return monkeys.at(monkey.left)?.items.push(workLevel);
    });
    monkeys[index].inspectedItems += monkey.items.length;
    monkeys[index].items = [];
  });

  return monkeys;
};

const processRounds =
  (time: number, processRound: (monkeys: Monkey[]) => Monkey[]) =>
  (monkeys: Monkey[]): Monkey[] => {
    return times(identity, time).reduce((monkeys) => {
      return processRound(monkeys);
    }, monkeys);
  };

pipe(
  monkeys,
  processRounds(20, monkeysProcessRound),
  A.map(prop('inspectedItems')),
  sort((a, b) => b - a),
  take(2),
  multiplyArr,
  tap((res) => console.log('part 1 answer is', res))
);

pipe(
  monkeys,
  processRounds(10000, monkeysProcessRound2),
  A.map(prop('inspectedItems')),
  sort((a, b) => b - a),
  take(2),
  multiplyArr,
  tap((res) => console.log('part 2 answer is', res))
);
