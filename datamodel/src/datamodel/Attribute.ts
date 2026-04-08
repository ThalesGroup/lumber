import { VisibleType } from './UMLType';

export class Attribute {
    public name: string;
    public type: string;
    public visibility: VisibleType;
    public isStatic: boolean;

    constructor(
        name: string,
        type: string,
        visibility: VisibleType = VisibleType.Private,
        isStatic = false
    ) {
        this.name = name;
        this.type = type;
        this.visibility = visibility;
        this.isStatic = isStatic;
    }
}
