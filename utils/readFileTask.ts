import * as fs from 'fs/promises';
import * as TE from 'fp-ts/TaskEither';
import { OpenMode, PathLike } from 'fs';
import { EventEmitter } from 'stream';

export const getDataContent = (
  filePath: PathLike | fs.FileHandle,
  options:
    | ({
        encoding: BufferEncoding;
        flag?: OpenMode | undefined;
      } & EventEmitter.Abortable)
    | BufferEncoding = 'utf-8'
): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    () => fs.readFile(filePath, options),
    (err) => new Error(`${err}`)
  );
