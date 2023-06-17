import { SingleBar } from 'cli-progress';

import OssUploader from '../../uploader/oss';

import type { TYargs, IStartCommandOptions } from '../../interface';

class Start {
  client: OssUploader;

  constructor(argv: IStartCommandOptions) {
    const { config } = argv
    this.client = new OssUploader({ config });

    this.run(argv).catch((error) => {
      console.error(error);
      process.exit(-1);
    });
  }

  /**
   * 入口
   * @param IStartCommandOptions
   */
  async run({ maxConcurrency = 5 }: IStartCommandOptions) {
    // 初始化客户端
    await this.client.initialClient();

    // 获取所有文件
    const files = this.client.findAllFiles();

    // 进度条
    const bar = new SingleBar({
      format:
        'progress [{bar}] {percentage}%',
    });

    bar.start(files.length, 0, {
      filename: '',
      key: '',
    });
    const start = Date.now();

    // 获取产物存放的路径
    await this.client.getSubDir();

    // 上传fn
    const uploadIteratorFn = async (file: string) => {
      const key = this.client?.createKey(file);

      if (key) {
        await this.client.upload({ file, key });
        bar.increment(1, { filename: file, key });
      }
    };

    const ret = [];
    const executing: Promise<any>[] = [];
    for (const file of files) {
      try {
        const p = uploadIteratorFn(file);
        ret.push(p);

        if (maxConcurrency <= files.length) {
          const task: any = p.then(() => executing.splice(executing.indexOf(task), 1));
          executing.push(task);
          if (executing.length >= maxConcurrency) {
            await Promise.race(executing);
          }
        }
      } catch (error) {
        bar.stop();
        throw error;
      }
    }

    await Promise.all(ret);

    bar.stop();
    const end = Date.now();
    const cost = parseInt(String((end - start) / 1000));
  }
}

const startCommand = {
  command: 'start',
  describe: '执行上传',
  builder: (yargs: TYargs) => {
    return yargs
      .example('$0 start --maxConcurrency=5', '# 最大并发数设置为5')
      .options({
        config: {
          group: 'Command Options',
          describe: '配置文件',
          type: 'string',
        },
        maxConcurrency: {
          group: 'Command Options',
          describe: '最大并发数配置',
          type: 'number',
        },
      });
  },
  handler: (argv: IStartCommandOptions): Start => new Start(argv),
}

export default startCommand
