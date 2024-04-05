import { Injectable } from '@nestjs/common';
import {
  FileFromOptions,
  Metadata,
  SupportedFileInput,
  uploadFile,
  Url,
  Uuid,
} from '@uploadcare/upload-client';

export type UploadImageParams = Parameters<typeof uploadFile>;

@Injectable()
export class ImageUploadService {
  private config: FileFromOptions = {
    publicKey: 'b7a6ce209edec31d0455',
    store: 'auto',
    metadata: {
      subsystem: 'uploader',
    },
  };

  async uploadImage(
    fileData: SupportedFileInput | Url | Uuid,
    metadata?: Metadata,
  ): Promise<void>;
  async uploadImage(
    fileData: SupportedFileInput | Url | Uuid,
    metadata?: Metadata,
    config?: FileFromOptions,
  ): Promise<void> {
    const _config = config || this.config;
    if (metadata) {
      _config.metadata = { ..._config.metadata, ...metadata };
    }
    const result = await uploadFile(fileData, _config);
    console.log(result);
    // return result;
  }
}
