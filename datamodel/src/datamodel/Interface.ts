import { Method } from './Method';
import { UMLStructure } from './UMLStructure';
import { VisibleType } from './UMLType';

export class Interface {
    public name = '';
    public methods: Map<string, Method>;
    public visibility: VisibleType;

    public dataModel?: UMLStructure;

    constructor(
        name: string,
        methods: Map<string, Method> = new Map(),
        visibility: VisibleType = VisibleType.Public
    ) {
        this.methods = methods;
        this.name = name;
        this.visibility = visibility;
    }

    public addMethod(method: Method): void {
        this.methods.set(method.name, method);
    }
}
