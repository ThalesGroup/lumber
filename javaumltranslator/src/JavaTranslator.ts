import { VisibleType } from './datamodel';
import { Class } from './datamodel/Class';
import { DataModelTranslator } from './datamodel/DataModelTranslator';
import { Enum } from './datamodel/Enum';
import { Interface } from './datamodel/Interface';
import { Method } from './datamodel/Method';
import { Parameter } from './datamodel/Parameter';
import { UMLStructure } from './datamodel/UMLStructure';

export class JavaTranslator implements DataModelTranslator {
    addSpaceIfNotNull(vis: VisibleType): string {
        return vis ? vis.toString() + ' ' : '';
    }

    translateParameters(parameters: Parameter[]) {
        return parameters.map((p) => `${p.type} ${p.name}`).join(', ');
    }
    translateMethod(method: Method, isInterface: boolean): string {
        return `\t${method.visibility} ${
            method.isAbstract && !isInterface ? 'abstract ' : ''
        }${method.returnType} ${method.name}(${this.translateParameters(
            method.parameters
        )})${isInterface || method.isAbstract ? ';' : ' {return null;}'}`;
    }
    translateMethods(methods: Method[], isInterface: boolean): string {
        return methods
            .map((met) => this.translateMethod(met, isInterface))
            .join('\n');
    }

    translateInterface(interfaceModel: Interface): string {
        let result = `${this.addSpaceIfNotNull(
            interfaceModel.visibility
        )}interface ${interfaceModel.name} {\n`;

        result += this.translateMethods(
            [...interfaceModel.methods.values()],
            true
        );

        result += '\n}';

        return result;
    }
    translateInterfaces(interfaces: Map<string, Interface>): string {
        return [...interfaces.values()]
            .map((int) => this.translateInterface(int))
            .join('\n\n');
    }

    translateClass(classModel: Class): string {
        const methodsToImplement = [...classModel.methods.values()];

        let result = `${
            classModel.isAbstract ? 'asbtract ' : ''
        }${this.addSpaceIfNotNull(classModel.visibility)}class ${
            classModel.name
        }`;

        if (classModel.extends) result += ' extends ' + classModel.extends;

        if (classModel.implements.length)
            result += ' implements ' + classModel.implements.join(', ');

        result += ' {';

        if (classModel.dataModel) {
            const dataModel = classModel.dataModel;

            for (const interfaceName of classModel.implements) {
                const interfaceModel = dataModel.interfaces.get(interfaceName);

                // Adds interface methods for implementation
                if (interfaceModel)
                    methodsToImplement.push(...interfaceModel.methods.values());
            }
        }

        // Attributes
        if (classModel.attributes.size) {
            result += '\n';
            result += [...classModel.attributes.values()]
                .map(
                    (attribute) =>
                        `\t${attribute.visibility} ${
                            attribute.isStatic ? 'static ' : ''
                        }${attribute.type} ${attribute.name};`
                )
                .join('\n');
        }

        // Methods
        if (methodsToImplement.length) {
            result += '\n';
            if (classModel.attributes.size) result += '\n';
            result += this.translateMethods(methodsToImplement, false);
        }

        result += '\n}';

        return result;
    }
    translateClasses(classes: Map<string, Class>): string {
        return [...classes.values()]
            .map((classMdl) => this.translateClass(classMdl))
            .join('\n\n');
    }

    translateEnum(enumModel: Enum): string {
        return `enum ${enumModel.name} {\n${[...enumModel.properties.values()]
            .map((p) => '\t' + p.name)
            .join(',\n')}\n}`;
    }
    translateEnums(enums: Map<string, Enum>): string {
        return [...enums.values()]
            .map((enumMdl) => this.translateEnum(enumMdl))
            .join('\n\n');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    translateAll(dataModel: UMLStructure): string {
        throw new Error('Method not implemented.');
    }
}
