import { Class } from './Class';
import { Enum } from './Enum';
import { Interface } from './Interface';
import { Association } from './Association';

export class UMLStructure {
    public classes: Map<string, Class>;
    public interfaces: Map<string, Interface>;
    public enums: Map<string, Enum>;

    public associations: Array<Association>;

    constructor(
        classes: Map<string, Class> = new Map(),
        interfaces: Map<string, Interface> = new Map(),
        enums: Map<string, Enum> = new Map(),
        associations: Array<Association> = []
    ) {
        this.classes = classes;
        this.interfaces = interfaces;
        this.enums = enums;
        this.associations = associations;

        for (const [, classMdl] of this.classes) classMdl.dataModel = this;
    }

    addAssociation(a: Association) {
        this.associations.push(a);
    }

    addClass(c: Class) {
        this.classes.set(c.name, c);
        c.dataModel = this;
    }

    addInterface(i: Interface) {
        this.interfaces.set(i.name, i);
    }

    addEnum(e: Enum) {
        this.enums.set(e.name, e);
    }
}
