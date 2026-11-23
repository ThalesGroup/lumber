import { Parser } from './parser/index';

export * from '@lumber/datamodel';
export * from './generator/index';
export * from './parser/index';

export interface Engine {
    id: string;
    name: string;

    parsers?: Record<string, Parser>;
    generators?: Record<string, Generator>;
}
