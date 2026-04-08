import { Class } from '../datamodel/Class';
import { Enum } from '../datamodel/Enum';
import { Interface } from '../datamodel/Interface';
import { UMLStructure } from '../datamodel/UMLStructure';

export interface IDataModelTranslator {
    translateInterface(interfaceModel: Interface): string;
    translateInterfaces(interfaces: Map<string, Interface>): string;

    translateClass(classModel: Class): string;
    translateClasses(classes: Map<string, Class>): string;

    translateEnum(enumModel: Enum): string;
    translateEnums(enums: Map<string, Enum>): string;

    translateAll(dataModel: UMLStructure): string;
}
