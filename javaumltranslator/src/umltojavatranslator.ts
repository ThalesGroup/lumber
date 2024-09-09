import { Enum } from './datamodel';
import { Class } from './datamodel/Class';
import { Interface } from './datamodel/Interface';
import { UMLStructure } from './datamodel/UMLStructure';
import { JavaTranslator } from './JavaTranslator';
import { umlToDatamodel } from './utils/umltodatamodel';

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
