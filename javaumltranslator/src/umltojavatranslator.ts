import {
    Class,
    Enum,
    Interface,
    UMLStructure,
    umlToDatamodel
} from 'umltranslator-datamodel';
import { JavaTranslator } from './JavaTranslator';

export class JavaFile {
    public name = '';
    public body = '';

    constructor(name: string, body: string) {
        this.name = name;
        this.body = body;
    }
}

export class UmlToJavaTranslator {
    public toJava(umlCode: string): JavaFile[] {
        const javaFiles: Array<JavaFile> = [];

        const umlStructure: UMLStructure = umlToDatamodel(umlCode);

        const translator = new JavaTranslator();

        umlStructure.classes.forEach((classModel: Class) => {
            javaFiles.push(
                new JavaFile(
                    classModel.name,
                    translator.translateClass(classModel)
                )
            );
        });
        umlStructure.interfaces.forEach((inter: Interface) => {
            javaFiles.push(
                new JavaFile(inter.name, translator.translateInterface(inter))
            );
        });
        umlStructure.enums.forEach((enumModel: Enum) => {
            javaFiles.push(
                new JavaFile(
                    enumModel.name,
                    translator.translateEnum(enumModel)
                )
            );
        });

        return javaFiles;
    }
}
