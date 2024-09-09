import {
    Attribute,
    Class,
    DataModelTranslator,
    Enum,
    Interface,
    UMLStructure,
    UMLType
} from './datamodel';

const NATIVES_TYPES = [
    'double',
    'float',
    'int32',
    'int64',
    'uint32',
    'uint64',
    'sint32',
    'sint64',
    'fixed32',
    'fixed64',
    'sfixed32',
    'sfixed64',
    'bool',
    'string',
    'bytes'
];

export class ProtobufTranslator implements DataModelTranslator {
    public translatedTypes: string[];
    public untranslatedTypes: string[];

    constructor() {
        this.translatedTypes = [];
        this.untranslatedTypes = [];
    }

    addTranslated(type: string) {
        const elementIndex = this.untranslatedTypes.indexOf(type);

        this.translatedTypes.push(type);

        if (elementIndex != -1) this.untranslatedTypes.splice(elementIndex, 1);
    }

    addUntranslated(type: string) {
        this.untranslatedTypes.push(type);
    }

    addUntranslatedIfNotPresent(type: string) {
        if (
            !this.translatedTypes.includes(type) &&
            !this.untranslatedTypes.includes(type)
        )
            this.addUntranslated(type);
    }

    replaceType(type: string): string {
        const replaceMap = [
            ['int', 'int32'],
            ['void', 'google.protobuf.Empty']
        ];

        for (const [regexVal, replaceType] of replaceMap) {
            if (new RegExp('^' + regexVal + '$').test(type)) {
                type = replaceType;
                break;
            }
        }

        return type;
    }

    checkType(type: string): string {
        type = this.replaceType(type);

        this.addUntranslatedIfNotPresent(type);

        return type;
    }

    translateInterface(interfaceModel: Interface): string {
        let interfaceStr = '';

        const isDataEvent = interfaceModel.name.endsWith('DataProvider');
        const isEvent = interfaceModel.name.endsWith('Events') && !isDataEvent;
        const isService = interfaceModel.name.endsWith('Services');

        const returnValuePrefix = isEvent ? 'stream ' : '';

        interfaceStr += `service ${interfaceModel.name} {\n`;
        for (const method of interfaceModel.methods.values()) {
            let returnType, paramType, methodName;

            methodName = method.name;

            if (isService) {
                returnType =
                    method.returnType == 'void'
                        ? 'google.protobuf.Empty'
                        : this.checkType(method.returnType);
                paramType = method.parameters.length
                    ? methodName + 'Request'
                    : 'google.protobuf.Empty';
            } else {
                if (methodName.startsWith('on'))
                    methodName = methodName.slice(2) + 'Event';

                if (method.parameters.length > 1) {
                    returnType = this.checkType(methodName);
                } else if (method.parameters.length == 1) {
                    returnType = method.parameters[0].type;
                } else {
                    returnType = 'google.protobuf.Empty';
                }

                methodName = (isDataEvent ? 'suscribe' : 'get') + methodName;
                paramType = 'google.protobuf.Empty';
            }

            interfaceStr += `\trpc ${methodName}(${paramType}) returns (${returnValuePrefix}${returnType}) {}\n`;

            if (method.parameters.length)
                this.addUntranslatedIfNotPresent(paramType);

            if (interfaceModel.dataModel) {
                if (isService) {
                    if (method.parameters.length)
                        // Request params
                        interfaceModel.dataModel.addClass(
                            new Class(
                                methodName + 'Request',
                                undefined,
                                undefined,
                                new Map(
                                    method.parameters.map((p) => [
                                        p.name,
                                        new Attribute(p.name, p.type)
                                    ])
                                )
                            )
                        );
                } else {
                    // DataEvents & Events
                    if (method.parameters.length > 1)
                        interfaceModel.dataModel?.addClass(
                            new Class(
                                returnType,
                                undefined,
                                undefined,
                                new Map(
                                    method.parameters.map((p) => [
                                        p.name,
                                        new Attribute(p.name, p.type)
                                    ])
                                )
                            )
                        );
                }
            } else {
                console.warn(
                    `Cannot create parameters & returns classes of method ${interfaceModel.name}#${methodName} because dataModel is not defined`
                );
            }
        }
        interfaceStr += '}';

        return interfaceStr;
    }
    translateInterfaces(interfaces: Map<string, Interface>): string {
        return [...interfaces.values()]
            .map((i) => this.translateInterface(i))
            .join('\n\n');
    }

    translateClass(classModel: Class): string {
        this.addTranslated(classModel.name);
        let classStr = '';

        classStr += `message ${classModel.name} {\n`;
        let i = 1;
        for (const attribute of classModel.attributes.values()) {
            classStr += `\t${this.checkType(attribute.type)} ${
                attribute.name
            } = ${i++};\n`;
        }
        classStr += '}';

        return classStr;
    }
    translateClasses(classes: Map<string, Class>): string {
        return [...classes.values()]
            .map((c) => this.translateClass(c))
            .join('\n\n');
    }

    translateEnum(enumModel: Enum): string {
        this.addTranslated(enumModel.name);
        let enumStr = '';

        enumStr += `enum ${enumModel.name} {\n`;
        for (const property of enumModel.properties.values()) {
            enumStr += `\t${property.name} = ${property.value};\n`;
        }
        enumStr += `}`;

        return enumStr;
    }
    translateEnums(enums: Map<string, Enum>): string {
        return [...enums.values()]
            .map((e) => this.translateEnum(e))
            .join('\n\n');
    }

    processAssociations(dataModel: UMLStructure) {
        dataModel.associations.forEach((association) => {
            const leftClass = dataModel.classes.get(association.leftClass);
            const rightClass = dataModel.classes.get(association.rightClass);

            let parent: Class | undefined;
            let type: string;

            if (UMLType.COMPOSITION_R_TO_L.test(association.separator)) {
                parent = rightClass;
                type = association.leftClass;
            } else {
                parent = leftClass;
                type = association.rightClass;
            }

            parent?.addAttribute(new Attribute(association.name, type));
        });
    }

    translateAll(dataModel: UMLStructure): string {
        const classAmount = dataModel.classes.size;
        const interfaceAmount = dataModel.interfaces.size;
        const enumAmount = dataModel.enums.size;

        this.translatedTypes = [];
        this.untranslatedTypes = [];

        this.processAssociations(dataModel);

        let resultStr = 'syntax = "proto3";\n\n';
        resultStr += 'import "google/protobuf/empty.proto";\n\n';
        resultStr += 'option java_multiple_files = true;\n';
        resultStr += 'option java_generic_services = false;\n';
        resultStr += 'option java_package = "{{packageName}}";';

        if (interfaceAmount) {
            resultStr += '\n\n';

            // Check that dataModel is defined on every interface
            for (const interfaceModel of dataModel.interfaces.values())
                if (!interfaceModel.dataModel)
                    interfaceModel.dataModel = dataModel;

            resultStr += this.translateInterfaces(dataModel.interfaces);
        }

        if (classAmount) {
            resultStr += '\n\n';
            resultStr += this.translateClasses(dataModel.classes);
        }

        if (enumAmount) {
            resultStr += '\n\n';
            resultStr += this.translateEnums(dataModel.enums);
        }

        if (this.untranslatedTypes.length) {
            resultStr += '\n\n// UNREFERENCED MESSAGE TYPES FROM PARSED UML\n';

            for (const untranslatedMessageName of [...this.untranslatedTypes]) {
                if (
                    !NATIVES_TYPES.includes(untranslatedMessageName) &&
                    !untranslatedMessageName.includes(
                        '.'
                    ) /* Prevent overwriting of libs */
                ) {
                    const classModel = new Class(untranslatedMessageName);

                    resultStr += '\n\n' + this.translateClass(classModel);
                }
            }
        }

        return resultStr;
    }
}
