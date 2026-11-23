import { DataModel } from '@lumber/datamodel';

export interface Parser<TOptions = unknown> {
    parse(input: string, options: TOptions): Promise<DataModel>;
}
