import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import type { Option } from 'fp-ts/Option';
import { pipe, flow } from 'fp-ts/function';

import { split, isNil, trim, startsWith, cond, equals, always, T, prop } from 'ramda';

import { getDataContent } from '../utils/readFileTask';

class Dir {
  name: string;
  parent: Dir | null;
  size: number;
  list: Record<string, Dir | File>;

  constructor(name: string, parent: Dir | null) {
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

const createDir = (name: string, parent: Dir | null) => new Dir(name, parent);

const isDir = (item: Dir | File) => item instanceof Dir;

class File {
  name: string;
  parent: Dir | null;
  size: number;
  constructor(name: string, parent: Dir | null, size: number) {
    this.name = name;
    this.parent = parent;
    this.size = size;
  }
}

const createFile = (name: string, parent: Dir | null, size: number) => new File(name, parent, size);

const isFile = (item: Dir | File) => item instanceof File;

const isCommand = startsWith('$');

const gotoDir = (path: string) => (currentDir: Dir) =>
  cond([
    [equals('..'), always(currentDir.parent)],
    [
      T,
      (path: string) => {
        const target = prop(path, currentDir.list);
        if (isDir(target)) return target as Dir;
        const newDir = createDir(path, currentDir);
        currentDir.addItem(newDir);
        return newDir;
      },
    ],
  ])(path);

const buildFilesTree = (init: Dir) => (lines: string[]) => {
  A.reduce<string, Dir | null>(init, (currentDir, line) => {
    if (isCommand(line)) {
      const [, command = '', path = ''] = split(' ', line);
      return equals(command, 'cd') && !isNil(currentDir) ? gotoDir(path)(currentDir) : currentDir;
    }

    const [head, name] = split(' ', line);

    if (currentDir) {
      const fileOrDir = equals(head, 'dir')
        ? createDir(name, currentDir)
        : createFile(name, currentDir, parseInt(head));
      currentDir.addItem(fileOrDir);

      return currentDir;
    }

    return currentDir;
  })(lines);
  return init;
};

const setAllDirSize = (root: Dir | File): Dir | File => {
  function setSize(root: Dir | File): number {
    if (isFile(root)) {
      return root.size;
    }

    const dir = root as Dir;
    const totalSize = Object.values(dir.list).reduce(
      (total, dirOrFile) => total + setSize(dirOrFile),
      0
    );
    dir.setSize(totalSize);
    return totalSize;
  }
  setSize(root);
  return root;
};

const sumOfTotalSizeDir = (root: Dir | File, max: number): number => {
  let sum = 0;
  function trace(root: Dir | File, max: number): number {
    if (isFile(root)) {
      const file = root as File;
      return file.size;
    }
    const dir = root as Dir;
    const dirTotalSize = Object.values(dir.list).reduce<number>((acc, dirOrFile) => {
      return acc + trace(dirOrFile, max);
    }, 0);
    dirTotalSize < max && (sum += dirTotalSize);
    return dirTotalSize;
  }
  trace(root, max);
  return sum;
};

const findMinReleaseDir = (root: Dir | File, releaseSize: number): Option<Dir | File> => {
  if (isFile(root)) {
    return O.none;
  }

  const dir = root as Dir;

  const subDir = Object.values(dir.list)
    .map((item) => findMinReleaseDir(item, releaseSize))
    .reduce((acc, dirOption) => {
      if (O.isSome(dirOption) && O.isSome(acc)) {
        const dirSize = dirOption.value.size;
        const accSize = acc.value.size;
        return dirSize < accSize ? dirOption : acc;
      }

      if (O.isSome(dirOption)) {
        return dirOption;
      }
      return acc;
    }, O.none);

  if (O.isSome(subDir)) {
    return subDir;
  }

  return dir.size >= releaseSize ? O.some(dir) : O.none;
};

const tree = createDir('root', null);

const part1Flow = flow(trim, split('\n'), buildFilesTree(tree), (root) =>
  sumOfTotalSizeDir(root.list['/'], 100000)
);

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
    (res) => console.log('answer is', res)
  )
)();

pipe(
  getDataContent('./day-7/data.txt'),
  TE.map(part2Flow),
  TE.match(
    (err) => console.log('you got some error', err),
    (res) => console.log('answer is', res)
  )
)();
