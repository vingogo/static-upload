import path from 'path';
import fg from 'fast-glob';

export const queryAllFiles = (workDir: string, directory: string, include: string[] = []): string[] => {
  let fileList: string[] = []
  if (include.length) {
    include.forEach((item) => {
      if (item) {
        const fl = fg.sync([`${path.join(workDir, directory)}/${item}`], { onlyFiles: true });

        fileList = fileList.concat(fl)
      }
    })
  } else {
    fileList = fg.sync([`${path.join(workDir, directory)}/**/*`], { onlyFiles: true });
  }
  return fileList
}
