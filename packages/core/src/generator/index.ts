import { DataModel } from '@lumber/datamodel';

export * from './IDataModelTranslator';

export interface Generator<TOptions = unknown> {
    generate(model: DataModel, options?: TOptions): Promise<GeneratedFile[]>;
}

export interface GeneratedFile {
    path: string;
    content: string;
}
