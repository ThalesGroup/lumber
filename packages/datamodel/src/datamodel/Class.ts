import { Attribute, DataModel, Method, VisibleType } from '.';

export class Class {
    public name = '';
    public attributes: Map<string, Attribute>;
    public methods: Map<string, Method>;
    public isAbstract: boolean;
    public visibility: VisibleType;

    public dataModel?: DataModel;

    public extends?: string;
    public implements: Array<string>;

    constructor(
        name: string,
        extend: string | undefined = undefined,
        implement: Array<string> = [],
        attributes: Map<string, Attribute> = new Map(),
        methods: Map<string, Method> = new Map(),
        isAbstract = false,
        visibility: VisibleType = VisibleType.Public,
        dataModel: DataModel | undefined = undefined
    ) {
        this.attributes = attributes;
        this.methods = methods;
        this.name = name;
        this.isAbstract = isAbstract;
        this.visibility = visibility;
        this.extends = extend;
        this.implements = implement;
        this.dataModel = dataModel;
    }

    public addAttribute(attribute: Attribute): void {
        this.attributes.set(attribute.name, attribute);
    }

    public addMethod(method: Method): void {
        this.methods.set(method.name, method);
    }
}
