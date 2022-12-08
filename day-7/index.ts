import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import type { Option } from 'fp-ts/Option';
import { pipe, flow } from 'fp-ts/function';

import {
  split,
  values,
  reduce,
  isNil,
  trim,
  startsWith,
  cond,
  equals,
  always,
  T,
  prop,
  sum,
} from 'ramda';

import { getDataContent } from '../utils/readFileTask';

class Dir {
  name: string;
  parent: Option<Dir>;
  size: number;
  list: Record<string, Dir | File>;

  constructor(name: string, parent: Option<Dir>) {
    this.name = name;
    this.parent = parent;
    this.list = {};
    this.size = 0;
  }

  addItem(item: Dir | File) {
    this.list[item.name] = item;
    return this;
  }

  setSize(size: number) {
    this.size = size;
    return this;
  }
}

const createDir = (name: string, parent: Option<Dir>) => new Dir(name, parent);

const isDir = (item: Dir | File) => item instanceof Dir;

class File {
  name: string;
  parent: Option<Dir>;
  size: number;
  constructor(name: string, parent: Option<Dir>, size: number) {
    this.name = name;
    this.parent = parent;
    this.size = size;
  }
}

const createFile = (name: string, parent: Option<Dir>, size: number) =>
  new File(name, parent, size);

const isFile = (item: Dir | File) => item instanceof File;

const isCommand = startsWith('$');

const gotoDir = (path: string) => (currentDir: Dir) =>
  cond([
    [equals('..'), always(currentDir.parent)],
    [
      T,
      (path: string) => {
        const target = prop(path, currentDir.list);
        if (isDir(target)) return O.some(target as Dir);

        const newDir = createDir(path, O.some(currentDir));
        currentDir.addItem(newDir);
        return O.some(newDir);
      },
    ],
  ])(path);

const buildFilesTree = (init: Dir) => (lines: string[]) => {
  A.reduce<string, Option<Dir>>(O.some(init), (currentDir, line) => {
    if (isCommand(line)) {
      const [, command = '', path = ''] = split(' ', line);
      const gotoTargetDir = gotoDir(path);
      return equals(command, 'cd') ? pipe(currentDir, O.chain(gotoTargetDir)) : currentDir;
    }

    const [head, name] = split(' ', line);

    if (currentDir) {
    }

    const fileOrDir = equals(head, 'dir')
      ? createDir(name, currentDir)
      : createFile(name, currentDir, parseInt(head));

    return pipe(
      currentDir,
      O.map((dir) => dir.addItem(fileOrDir))
    );
  })(lines);
  return init;
};

const setAllDirSize = (root: Dir | File): Dir | File => {
  function setSize(root: Dir | File): number {
    if (isFile(root)) {
      return root.size;
    }

    const dir = root as Dir;
    const totalSize = pipe(dir.list, values, A.map(setSize), sum);

    dir.setSize(totalSize);
    return totalSize;
  }
  setSize(root);
  return root;
};

const sumOfTotalSizeDir = (root: Dir | File, max: number): number => {
  if (isFile(root)) return 0;

  const dir = root as Dir;

  const sumOfSubDirSize = pipe(
    dir.list,
    values,
    A.map((item) => sumOfTotalSizeDir(item, max)),
    sum
  );

  return dir.size < max ? sumOfSubDirSize + dir.size : sumOfSubDirSize;
};

const findMinReleaseDir = (root: Dir | File, releaseSize: number): Option<Dir> => {
  if (isFile(root)) O.none;

  const dir = root as Dir;

  const subDir = pipe(
    dir.list,
    values,
    A.map((item) => findMinReleaseDir(item, releaseSize)),
    reduce<Option<Dir>, Option<Dir>>((acc, dirOption) => {
      if (O.isSome(dirOption) && O.isSome(acc)) {
        const dirSize = dirOption.value.size;
        const accSize = acc.value.size;
        return dirSize < accSize ? dirOption : acc;
      }

      return pipe(
        dirOption,
        O.alt(() => acc)
      );
    }, O.none)
  );

  return pipe(
    subDir,
    O.alt(() => (dir.size >= releaseSize ? O.some(dir) : O.none))
  );
};

const tree = createDir('root', O.none);

const part1Flow = flow(trim, split('\n'), buildFilesTree(tree), setAllDirSize, (root) => {
  if (isFile(root)) return 0;

  const dir = root as Dir;
  return sumOfTotalSizeDir(dir.list['/'], 100000);
});

const part2Flow = flow(
  trim,
  split('\n'),
  buildFilesTree(tree),
  (root) => setAllDirSize(root.list['/']),
  (root) => {
    const rootSize = isDir(root) ? (root as Dir).size : 0;
    const minReleaseSize = 30000000 - (70000000 - rootSize);
    return findMinReleaseDir(root, minReleaseSize);
  },
  O.match(
    () => 0,
    (dir) => dir.size
  )
);

pipe(
  getDataContent('./day-7/data.txt'),
  TE.map(part1Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('part 1 answer is', res)
  )
)();

pipe(
  getDataContent('./day-7/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('part 2 answer is', res)
  )
)();
