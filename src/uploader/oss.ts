import fse from 'fs-extra';
import OSS from 'ali-oss';
import BaseUploader from './baseUploader';

import type { ICredential } from '../interface';

export default class OSSUploader extends BaseUploader {
  private oss: OSS | undefined;

  async initialClient(): Promise<void> {
    const credentials = this.initialCredentials();

    const { region, bucket } = this.context;

    this.oss = new OSS({
      region,
      bucket,
      ...credentials,
    });

    await this.parseConfig();
  }

  private initialCredentials(): ICredential {
    if (!process.env.OSS_AK || !process.env.OSS_SK) {
      new Error('AK and SK do not exist in environment variables')
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
