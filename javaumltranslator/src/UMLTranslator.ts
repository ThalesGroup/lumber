import {
    EnumProperty,
    Enum,
    DataModelTranslator,
    Association,
    Attribute,
    Class,
    Interface,
    Method,
    Parameter,
    UMLStructure,
    VISIBLE_TYPES_TO_UML,
    MultiplicityType
} from './datamodel';

export class UMLTranslator implements DataModelTranslator {
    translateParameters(params: Parameter[]): string {
        return params.map((p) => p.name + ' : ' + p.type).join(', ');
    }
    translateMethod(method: Method): string {
        return (
            '\t' +
            VISIBLE_TYPES_TO_UML.get(method.visibility) +
            ' ' +
            (method.isAbstract ? 'abstract ' : '') +
            method.returnType +
            ' ' +
            method.name +
            '(' +
            this.translateParameters(method.parameters) +
            ')'
        );
    }

    translateMethods(methods: Map<string, Method>): string {
        return [...methods.values()]
            .map((m) => this.translateMethod(m))
            .join('\n');
    }

    translateAttribute(attr: Attribute): string {
        return (
            '\t' +
            VISIBLE_TYPES_TO_UML.get(attr.visibility) +
            ' ' +
            attr.type.trim() +
            ' ' +
            attr.name
        );
    }
    translateAttributes(attributes: Map<string, Attribute>): string {
        return [...attributes.values()]
            .map((a) => this.translateAttribute(a))
            .join('\n');
    }
    translateClass(classModel: Class) {
        let resultStr = `${classModel.isAbstract ? 'abstract ' : ''}class ${
            classModel.name
        }`;

        if (classModel.extends) resultStr += ` extends ${classModel.extends}`;

        if (classModel.implements.length)
            resultStr += ` implements ${classModel.implements.join(', ')}`;

        if (classModel.attributes.size || classModel.methods.size) {
            resultStr += ' {\n';

            if (classModel.attributes.size) {
                resultStr += this.translateAttributes(classModel.attributes);
            }

            if (classModel.methods.size) {
                if (classModel.attributes.size) resultStr += '\n\n';
                resultStr += this.translateMethods(classModel.methods);
            }

            resultStr += '\n}';
        }

        return resultStr;
    }

    translateClasses(classes: Map<string, Class>) {
        return [...classes.values()]
            .map((c) => this.translateClass(c))
            .join('\n\n');
    }

    translateInterface(interfaceModel: Interface) {
        return `interface ${interfaceModel.name} {\n${this.translateMethods(
            interfaceModel.methods
        )}\n}`;
    }

    translateInterfaces(interfaces: Map<string, Interface>) {
        return [...interfaces.values()]
            .map((i) => this.translateInterface(i))
            .join('\n\n');
    }

    translateProperties(props: Map<string, EnumProperty>) {
        const propIt = props.values();
        let itResult = propIt.next();

        let resultStr = '';

        while (!itResult.done) {
            resultStr +=
                '\n\t' +
                itResult.value.name +
                (itResult.value.value ? ' : ' + itResult.value.value : '');

            itResult = propIt.next();
        }
        return resultStr;
    }
    translateEnum(enumModel: Enum) {
        return `enum ${enumModel.name}${
            enumModel.properties.size
                ? ` {${this.translateProperties(enumModel.properties)}\n}`
                : ''
        }`;
    }
    translateEnums(enums: Map<string, Enum>) {
        return [...enums.values()]
            .map((e) => this.translateEnum(e))
            .join('\n\n');
    }

    translateAssociations(associations: Array<Association>): string {
        function displayMultiplicity(multType: MultiplicityType): string {
            switch (multType) {
                case MultiplicityType.NotSpecified:
                    return '';
                default:
                    return '"' + multType.toString() + '"';
            }
        }
        return associations
            .map((asso) => {
                return `${asso.leftClass} ${displayMultiplicity(
                    asso.rightToLeftAssociation
                )} *--> ${displayMultiplicity(asso.leftToRightAssociation)} ${
                    asso.rightClass
                }${asso.name.length ? ' : ' + asso.name : ''}`;
            })
            .join('\n');
    }

    translateAll(dataModel: UMLStructure) {
        let resultStr = '@startuml\n';

        if (dataModel.classes.size)
            resultStr += this.translateClasses(dataModel.classes);

        if (dataModel.interfaces.size) {
            if (resultStr.length) resultStr += '\n\n';
            resultStr += this.translateInterfaces(dataModel.interfaces);
        }

        if (dataModel.enums.size) {
            if (resultStr.length) resultStr += '\n\n';
            resultStr += this.translateEnums(dataModel.enums);
        }

        if (dataModel.associations.length) {
            if (resultStr.length) resultStr += '\n\n';
            resultStr += this.translateAssociations(dataModel.associations);
        }

        resultStr += '\n@enduml';

        return resultStr;
    }
}
