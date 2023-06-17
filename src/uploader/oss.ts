import path from 'path';
import fse from 'fs-extra';
import OSS from 'ali-oss';
import fg from 'fast-glob';
import * as constants from '../constants'
import type { ICredential, IWorkContext } from '../interface';

/**
 * OSS上传
 */
export default class OSSUploader {
  subDir?: string;
  context: IWorkContext;

  private oss: OSS;
  private cwd: string;

  constructor({ config }: { config: string }) {
    const cwd = process.cwd();

    this.cwd = cwd;

    const DEFAULT_CONFIG_FILE = constants.configAbsFile['oss'];

    if (!config && !fse.existsSync(path.join(cwd, DEFAULT_CONFIG_FILE))) {
      throw new Error(
        '配置文件不存在，请配置--config，或在执行cli的根目录配置oss.config.js'
      );
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

  /**
   * 初始化客户端
   */
  async initialClient(): Promise<void> {
    const credentials = this.initialCredentials();
    const { region, bucket } = this.context;
    this.oss = new OSS({
      region,
      bucket,
      ...credentials,
    });
  }

  /**
   * 初始化认证
   */
  private initialCredentials(): ICredential {
    if (!process.env.OSS_AK || !process.env.OSS_SK) {
      new Error('环境变量中不存在AK以及SK')
    }
    return {
      accessKeyId: (process.env.OSS_AK) as string,
      accessKeySecret: (process.env.OSS_SK) as string,
    }
  }

  /**
   * 查找所有文件
   */
  public findAllFiles(): string[] {
    const { workDir, directory, include = [] } = this.context;
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

  /**
   * 上传
   */
  async upload({ file, key }: { file: string; key: string }): Promise<{ name: string; res: OSS.NormalSuccessResponse }> {
    const { oss } = this;
    try {
      const stream = fse.createReadStream(file);
      const result = await oss.putStream(key, stream);
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  /**
   * 生成文件key
   * @param file
   */
  createKey(file: string): string {
    const { context, subDir } = this;
    const { workDir, directory } = context;
    const key = `${subDir}/${path.relative(
      path.join(workDir, directory),
      file
    )}`;
    return key;
  }

  /**
   * 获取oss存放的文件夹
   */
  async getSubDir(): Promise<void> {
    const { context } = this;
    const { prefix } = context;
    this.subDir = typeof prefix === 'function' ? await prefix() : prefix;
  }
}
