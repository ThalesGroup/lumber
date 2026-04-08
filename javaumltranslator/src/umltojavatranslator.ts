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
    public packageName = '';
    public body = '';

    constructor(name: string, body: string, packageName: string = '') {
        this.name = name;
        this.body = body;
        this.packageName = packageName;
    }
}

export class UmlToJavaTranslator {
    private parseNameAndPackage(typeName: string): {
        name: string;
        package?: string;
    } {
        let name = typeName;
        let packagePath: string[] = [];

        if (typeName.includes('.')) {
            [name, ...packagePath] = typeName.split('.').reverse();

            packagePath = packagePath.reverse();
        }

        return {
            name,
            package: packagePath.length > 0 ? packagePath.join('.') : undefined
        };
    }

    public toJava(umlCode: string): JavaFile[] {
        const javaFiles: Array<JavaFile> = [];

        const umlStructure: UMLStructure = umlToDatamodel(umlCode);

        const translator = new JavaTranslator();

        umlStructure.classes.forEach((classModel: Class) => {
            const { name, package: packageName } = this.parseNameAndPackage(
                classModel.name
            );
            javaFiles.push(
                new JavaFile(
                    name,
                    translator.translateClass(classModel),
                    packageName
                )
            );
        });
        umlStructure.interfaces.forEach((inter: Interface) => {
            const { name, package: packageName } = this.parseNameAndPackage(
                inter.name
            );
            javaFiles.push(
                new JavaFile(
                    name,
                    translator.translateInterface(inter),
                    packageName
                )
            );
        });
        umlStructure.enums.forEach((enumModel: Enum) => {
            const { name, package: packageName } = this.parseNameAndPackage(
                enumModel.name
            );
            javaFiles.push(
                new JavaFile(
                    name,
                    translator.translateEnum(enumModel),
                    packageName
                )
            );
        });

        return javaFiles;
    }
}
