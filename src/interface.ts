import type yargs from 'yargs';

export type TSupportTarget = 'oss';
export interface IConfig {
  bucket: string;
  directory: (() => string) | string;
  region?: string;
  include?: string[];
  sourceMap?: { prefix: string } | null;
  prefix: (() => string) | string;
  getCacheControl?: (file: string) => string;
}

export interface IUploadConfig extends Omit<IConfig, 'prefix'> {
  prefix: string;
  [key: string]: unknown
}

export type TYargs = ReturnType<typeof yargs>;

export interface IStartCommandOptions {
  /**
   * 上传配置项
   */
  config: string;
  /**
   * 最大并发数
   */
  max: number
}

export interface IWorkContext extends IConfig {
  workDir: string;
}

export interface ICredential {
  accessKeyId: string;
  accessKeySecret: string;
}

