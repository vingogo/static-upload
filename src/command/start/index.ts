import { SingleBar } from 'cli-progress';
import chalk from 'chalk';

import OssUploader from '../../uploader/oss';

import type { TYargs, IStartCommandOptions } from '../../interface';

class Start {
  client: OssUploader;

  constructor(argv: IStartCommandOptions) {
    const { config } = argv
    this.client = new OssUploader({ config });

    this.run(argv).catch((error) => {
      console.log(chalk.red(error));
      process.exit(-1);
    });
  }

  async run({ max = 5, prefix, directory }: IStartCommandOptions) {
    try {
      await this.client.initialClient({ prefix, directory });
    } catch (error) {
      return Promise.reject(error);
    }

    const files = this.client.findAllFiles();

    const bar = new SingleBar({
      format:
        'progress [{bar}] {percentage}%',
    });

    bar.start(files.length, 0, {
      filename: '',
      key: '',
    });
    const start = Date.now();

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

        if (max <= files.length) {
          const task: any = p.then(() => executing.splice(executing.indexOf(task), 1));
          executing.push(task);
          if (executing.length >= max) {
            await Promise.race(executing);
          }
        }
      } catch (error) {
        bar.stop();
        return Promise.reject(error);
      }
    }

    await Promise.all(ret);

    bar.stop();
    const end = Date.now();
    const cost = parseInt(String((end - start) / 1000));

    console.log(
      chalk.green(
        `\n已成功上传 ${files.length} 个文件\n\n- bucket: ${this.client.context.bucket} \n- prefix: ${this.client.subDir} \n- 耗时：${cost}s\n`
      )
    );
  }
}

const startCommand = {
  command: 'start',
  describe: '执行上传',
  builder: (yargs: TYargs) => {
    return yargs
      .example('$0 start --max=5', '# 最大并发数设置为5')
      .options({
        config: {
          group: 'Command Options',
          describe: '配置文件',
          type: 'string',
        },
        prefix: {
          group: 'Command Options',
          describe: '上传文件前缀',
          type: 'string',
        },
        directory: {
          group: 'Command Options',
          describe: '待上传文件夹',
          type: 'string',
        },
        max: {
          group: 'Command Options',
          describe: '最大并发数配置',
          type: 'number',
        },
      });
  },
  handler: (argv: IStartCommandOptions): Start => new Start(argv),
}

export default startCommand
