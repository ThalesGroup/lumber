import { Class } from './Class';
import { Enum } from './Enum';
import { Interface } from './Interface';
import { UMLStructure } from './UMLStructure';

export interface DataModelTranslator {
    translateInterface(interfaceModel: Interface): string;
    translateInterfaces(interfaces: Map<string, Interface>): string;

    translateClass(classModel: Class): string;
    translateClasses(classes: Map<string, Class>): string;

    translateEnum(enumModel: Enum): string;
    translateEnums(enums: Map<string, Enum>): string;

    translateAll(dataModel: UMLStructure): string;
}
