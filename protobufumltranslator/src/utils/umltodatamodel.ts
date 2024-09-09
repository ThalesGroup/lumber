import {
    Enum,
    Association,
    MultiplicityType,
    Attribute,
    Class,
    Interface,
    Method,
    UMLStructure,
    EnumProperty
} from '../datamodel';

import { UMLType, VISIBLE_TYPES, Modifiers } from '../datamodel/UMLType';

function lineFromIndex(str: string, ind: number) {
    return str.slice(0, ind).split(/\n/g).length - 1;
}

function getMultiplicityType(mult: string): MultiplicityType {
    switch (mult) {
        case '1':
            return MultiplicityType.One;
        case '1..*':
            return MultiplicityType.OneOrMany;
        case '*':
            return MultiplicityType.Many;
        case '0..1':
            return MultiplicityType.ZeroOrOne;
        default:
            return MultiplicityType.NotSpecified;
    }
}

export function umlToDatamodel(umlStr: string): UMLStructure {
    const classes: Map<string, Class> = new Map();
    const interfaces: Map<string, Interface> = new Map();
    const enums: Map<string, Enum> = new Map();
    const associations: Array<Association> = [];

    const lineModifiers: Map<number, Modifiers> = new Map();

    // PROCESS MODIFIERS
    umlStr = umlStr
        .split(/\n/g)
        .map((line, lineInd) => {
            const lineModifier: Modifiers =
                lineModifiers.get(lineInd) || ({} as Modifiers);

            for (const modifier of [
                ...line.matchAll(UMLType.MODIFIERS)
            ].reverse()) {
                const [matchedStr, name] = modifier;

                switch (name) {
                    case 'abstract':
                        lineModifier.abstract = true;
                        break;
                    case 'static':
                        lineModifier.static = true;
                        break;
                    case 'field':
                        lineModifier.field = true;
                        break;
                    case 'method':
                        lineModifier.method = true;
                        break;

                    default:
                        console.log('[Warning] Unknow modifier : ' + name);
                }

                line =
                    line.slice(0, modifier.index) +
                    line.slice(Number(modifier.index) + matchedStr.length);
            }

            lineModifiers.set(lineInd, lineModifier);
            return line;
        })
        .join('\n');

    // CLASS
    for (const classReg of umlStr.matchAll(UMLType.CLASS)) {
        const attributes: Map<string, Attribute> = new Map();
        const methods: Map<string, Method> = new Map();

        const classInst = new Class(classReg[1]);

        const classLine = lineFromIndex(umlStr, Number(classReg.index));

        const body = classReg[0].split('{').slice(1).join('{');

        if (classReg[2])
            // EXTRACT EXTENDS
            classInst.extends = classReg[2]
                .trim()
                .split(/ +/)
                .slice(1)
                .join(' ');

        if (classReg[3])
            // EXTRACT IMPLEMENTS
            classInst.implements = classReg[3]
                .trim()
                .split(/ +/)
                .slice(1)
                .join('')
                .split(',');

        if (body) {
            for (const line of body.split('\n')) {
                let regResult;

                if ((regResult = line.match(UMLType.ATTRIBUTE_TYPE))) {
                    // - Array<String> test
                    const [, vis, name, type] = regResult;

                    if (type && name) {
                        const isStatic = lineModifiers.get(
                            classLine +
                                lineFromIndex(body, body.indexOf(regResult[0]))
                        )?.static;

                        const attribute = new Attribute(
                            name,
                            type,
                            VISIBLE_TYPES.get(vis),
                            isStatic
                        );

                        attributes.set(attribute.name, attribute);
                    }
                } else if ((regResult = line.match(UMLType.TYPE_ATTRIBUTE))) {
                    // - test : Array<String>
                    const [, vis, type, name] = regResult;

                    if (type && name) {
                        const isStatic = lineModifiers.get(
                            classLine +
                                lineFromIndex(body, body.indexOf(regResult[0]))
                        )?.static;

                        const attribute = new Attribute(
                            name,
                            type,
                            VISIBLE_TYPES.get(vis),
                            isStatic
                        );

                        attributes.set(attribute.name, attribute);
                    }
                } else if ((regResult = line.match(UMLType.METHOD_TYPE))) {
                    // - void test(..)
                    const [, visibility, name, parametersStr, returnType] =
                        regResult;
                    const isAbstract = lineModifiers.get(
                        classLine +
                            lineFromIndex(body, body.indexOf(regResult[0]))
                    )?.abstract;
                    const isStatic = lineModifiers.get(
                        classLine +
                            lineFromIndex(body, body.indexOf(regResult[0]))
                    )?.static;

                    const method = new Method(
                        name,
                        returnType,
                        [],
                        VISIBLE_TYPES.get(visibility),
                        isAbstract,
                        isStatic
                    );

                    if (parametersStr) {
                        method.buildParametersFrom(parametersStr);
                    }

                    methods.set(method.name, method);
                } else if ((regResult = line.match(UMLType.TYPE_METHOD))) {
                    // - test(..) : void
                    const [, visibility, returnType, name, parametersStr] =
                        regResult;

                    const isAbstract = lineModifiers.get(
                        classLine +
                            lineFromIndex(body, body.indexOf(regResult[0]))
                    )?.abstract;
                    const isStatic = lineModifiers.get(
                        classLine +
                            lineFromIndex(body, body.indexOf(regResult[0]))
                    )?.static;

                    const method = new Method(
                        name,
                        returnType,
                        [],
                        VISIBLE_TYPES.get(visibility),
                        isAbstract,
                        isStatic
                    );

                    if (parametersStr) {
                        method.buildParametersFrom(parametersStr);
                    }

                    methods.set(method.name, method);
                }
            }
        }

        classInst.attributes = attributes;
        classInst.methods = methods;
        classInst.isAbstract = lineModifiers.get(classLine)?.abstract || false;

        classes.set(classReg[1], classInst);
    }

    // CLASS INLINE ATTRIBUTES
    for (const inlineAttributesReg of umlStr.matchAll(
        UMLType.INLINE_ATTRIBUTES
    )) {
        const [, vis, className, type, name] = inlineAttributesReg;

        const isStatic = lineModifiers.get(
            lineFromIndex(umlStr, Number(inlineAttributesReg.index))
        )?.static;

        const attributeObj = new Attribute(
            name,
            type,
            VISIBLE_TYPES.get(vis),
            !!isStatic
        );

        const classObj = classes.get(className);

        if (classObj) {
            classObj.addAttribute(attributeObj);
        }
    }

    // Interface
    for (const interfaceReg of umlStr.matchAll(UMLType.INTERFACE)) {
        const methods: Map<string, Method> = new Map();

        const body = interfaceReg[0].split('{').slice(1).join('{');

        if (body) {
            for (const line of body.split('\n')) {
                let regResult;

                if ((regResult = line.match(UMLType.METHOD_TYPE))) {
                    // - void test(..)
                    const [, visibility, name, parametersStr, returnType] =
                        regResult;

                    const method = new Method(
                        name,
                        returnType,
                        [],
                        VISIBLE_TYPES.get(visibility)
                    );

                    if (parametersStr) {
                        method.buildParametersFrom(parametersStr);
                    }

                    methods.set(method.name, method);
                } else if ((regResult = line.match(UMLType.TYPE_METHOD))) {
                    // - test(..) : void
                    const [, visibility, returnType, name, parametersStr] =
                        regResult;

                    const method = new Method(
                        name,
                        returnType,
                        [],
                        VISIBLE_TYPES.get(visibility)
                    );

                    if (parametersStr) {
                        method.buildParametersFrom(parametersStr);
                    }

                    methods.set(method.name, method);
                }
            }
        }

        const interfaceInst = new Interface(
            interfaceReg[1],
            methods,
            VISIBLE_TYPES.get(interfaceReg[1])
        );

        interfaces.set(interfaceReg[1], interfaceInst);
    }

    // CLASS/INTERFACE INLINE METHODS
    for (const inlineMethodsReg of umlStr.matchAll(UMLType.INLINE_METHODS)) {
        const [, vis, classOrInterfaceName, type, name, parametersStr] =
            inlineMethodsReg;

        const isAbstract = lineModifiers.get(
            lineFromIndex(umlStr, Number(inlineMethodsReg.index))
        )?.abstract;

        const methodObj = new Method(
            name,
            type,
            undefined,
            VISIBLE_TYPES.get(vis),
            !!isAbstract
        );

        methodObj.buildParametersFrom(parametersStr);

        const classObj = classes.get(classOrInterfaceName);

        if (classObj) classObj.addMethod(methodObj);
        else {
            const interfaceObj = interfaces.get(classOrInterfaceName);

            interfaceObj?.addMethod(methodObj);
        }
    }

    // Enum
    for (const enumReg of umlStr.matchAll(UMLType.ENUM)) {
        const enumModel = new Enum(enumReg[1]);

        const body = enumReg[0].split('{').slice(1).join('{');

        if (body) {
            for (const line of body.split('\n')) {
                const regResult = line.match(UMLType.ENUM_PROPERTY);

                if (regResult) {
                    const [, name, value] = regResult;

                    enumModel.addProperty(new EnumProperty(name, value || ''));
                }
            }
        }

        enums.set(enumModel.name, enumModel);
    }

    // COMPOSITION EXTRACTION
    for (const compositionReg of umlStr.matchAll(UMLType.COMPOSITION)) {
        const [
            ,
            classLeft,
            multiLeft,
            associationSeparator,
            multiRight,
            classRight,
            assocName
        ] = compositionReg;

        const association = new Association(
            classLeft,
            classRight,
            associationSeparator,
            getMultiplicityType(multiLeft),
            getMultiplicityType(multiRight),
            assocName
        );

        associations.push(association);
    }

    // ASSOCIATION EXTRACTION
    for (const associationReg of umlStr.matchAll(UMLType.ASSOCIATION)) {
        const [, classLeft, multiLeft, multiRight, classRight, assocName] =
            associationReg;

        const association = new Association(
            classLeft,
            classRight,
            '--',
            getMultiplicityType(multiLeft),
            getMultiplicityType(multiRight),
            assocName
        );

        associations.push(association);
    }

    return new UMLStructure(classes, interfaces, enums, associations);
}
