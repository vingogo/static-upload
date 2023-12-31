import fse from 'fs-extra';
import OSS from 'ali-oss';
import BaseUploader from './baseUploader';

import type { ICredential, IClientOptions } from '../interface';

export default class OSSUploader extends BaseUploader {
  private oss: OSS | undefined;

  async initialClient(argv: IClientOptions): Promise<void> {
    const credentials = this.initialCredentials();

    const { region, bucket } = this.context;

    this.oss = new OSS({
      region,
      bucket,
      ...credentials,
    });

    await this.parseConfig(argv);
  }

  private initialCredentials(): ICredential {
    if (!process.env.OSS_AK || !process.env.OSS_SK) {
      throw new Error('OSS_AK and OSS_SK do not exist in environment variables')
    }
    return {
      accessKeyId: (process.env.OSS_AK) as string,
      accessKeySecret: (process.env.OSS_SK) as string,
    }
  }

  async upload({ file, key }: { file: string; key: string }) {
    const { oss } = this;
    try {
      const stream = fse.createReadStream(file);
      await oss?.putStream(key, stream);
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
