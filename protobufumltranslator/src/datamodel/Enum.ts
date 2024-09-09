import { EnumProperty } from './EnumProperty';

export class Enum {
    public name: string;
    public properties: Map<string, EnumProperty>;

    constructor(
        name: string,
        properties: Map<string, EnumProperty> = new Map()
    ) {
        this.name = name;
        this.properties = properties;
    }

    public addProperty(prop: EnumProperty): void {
        this.properties.set(prop.name, prop);
    }
}
