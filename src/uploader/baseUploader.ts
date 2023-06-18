import path from 'path';
import fse from 'fs-extra';
import { queryAllFiles } from '../utils/queryFiles';
import * as constants from '../constants'

import type { IWorkContext, IClientOptions } from '../interface';

export default class BaseUploader {
  context: IWorkContext;
  subDir = '/';
  directory = 'dist';
  cwd = process.cwd();

  constructor({ config }: { config: string }) {
    const cwd = process.cwd();

    this.cwd = cwd;

    const DEFAULT_CONFIG_FILE = constants.configAbsFile['oss'];

    if (!config && !fse.existsSync(path.join(cwd, DEFAULT_CONFIG_FILE))) {
      throw new Error('No configuration file was found, or the configuration file was specified by --config');
    }

    if (config) {
      this.context = {
        ...require(config),
        workDir: path.dirname(config),
      };
      return;
    }

    this.context = {
      ...require(path.join(cwd, DEFAULT_CONFIG_FILE)),
      workDir: cwd,
    };
  }

  public findAllFiles(): string[] {
    const { workDir, include = [] } = this.context;

    return queryAllFiles(workDir, this.directory, include)
  }

  public async parseConfig(argv: IClientOptions) {
    const { context } = this;
    const { prefix, directory } = context;
    this.subDir = argv.prefix || (typeof prefix === 'function' ? await prefix() : prefix);
    this.directory = argv.directory || (typeof directory === 'function' ? await directory() : directory);
  }

  public createKey(file: string): string {
    const { context, subDir } = this;
    const { workDir } = context;
    const key = `${subDir}/${path.relative(path.join(workDir, this.directory), file)}`;

    return key;
  }
}
