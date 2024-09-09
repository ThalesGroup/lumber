import {
    BaseJavaCstVisitorWithDefaults,
    ClassDeclarationCtx,
    NormalClassDeclarationCtx,
    MethodDeclarationCtx,
    ClassModifierCtx,
    TypeIdentifierCtx,
    ClassBodyCtx,
    ClassBodyDeclarationCtx,
    ClassMemberDeclarationCtx,
    MethodHeaderCtx,
    MethodDeclaratorCtx,
    ResultCtx,
    UnannTypeCtx,
    UnannPrimitiveTypeWithOptionalDimsSuffixCtx,
    UnannReferenceTypeCtx,
    UnannPrimitiveTypeCtx,
    NumericTypeCtx,
    IntegralTypeCtx,
    FloatingPointTypeCtx,
    UnannClassOrInterfaceTypeCtx,
    UnannClassTypeCtx,
    FieldDeclarationCtx,
    FieldModifierCtx,
    VariableDeclaratorListCtx,
    VariableDeclaratorCtx,
    VariableDeclaratorIdCtx,
    MethodModifierCtx,
    TypeParameterCtx,
    FormalParameterCtx,
    FormalParameterListCtx,
    VariableParaRegularParameterCtx,
    VariableArityParameterCtx,
    SuperclassCtx,
    SuperinterfacesCtx,
    ClassTypeCtx,
    InterfaceTypeListCtx,
    InterfaceTypeCtx,
    InterfaceDeclarationCtx,
    InterfaceModifierCtx,
    NormalInterfaceDeclarationCtx,
    InterfaceBodyCtx,
    InterfaceMemberDeclarationCtx,
    InterfaceMethodDeclarationCtx,
    InterfaceMethodModifierCtx,
    EnumDeclarationCtx,
    EnumBodyCtx,
    EnumConstantListCtx,
    EnumConstantCtx,
    PackageDeclarationCtx,
    TypeArgumentsCtx,
    TypeArgumentListCtx,
    TypeArgumentCtx,
    ReferenceTypeCtx,
    DimsCtx,
    ClassOrInterfaceTypeCtx,
    PrimitiveTypeCtx
} from 'java-parser';
import {
    UMLStructure,
    Method,
    VisibleType,
    Class,
    Attribute,
    Parameter,
    Interface,
    Enum,
    Association,
    MultiplicityType,
    EnumProperty
} from '../datamodel';

type ClassMembers = {
    methods: Map<string, Method>;
    attributes: Map<string, Attribute>;
};

export class JavaToDatamodelVisitor extends BaseJavaCstVisitorWithDefaults {
    private structure: UMLStructure;
    private currentPackage: string;

    constructor() {
        super();
        this.structure = new UMLStructure();
        this.currentPackage = '';
        this.validateVisitor();
    }

    get datamodel(): UMLStructure {
        return this.structure;
    }

    clearPackage() {
        this.currentPackage = '';
    }

    packageDeclaration(ctx: PackageDeclarationCtx) {
        this.currentPackage =
            ctx.Identifier.map((i) => i.image).join('.') + '.';
    }

    /*
        CLASS
    */

    classDeclaration(ctx: ClassDeclarationCtx) {
        const normalClassDeclaration = ctx.normalClassDeclaration?.[0].children;
        const modifiers = {
            isAbstract: false,
            visibility: VisibleType.Public
        };

        if (normalClassDeclaration) {
            const classDeclaration = this.normalClassDeclaration(
                normalClassDeclaration
            );

            if (ctx.classModifier)
                for (const { children: classModifier } of ctx.classModifier) {
                    const modifier = this.classModifier(classModifier);

                    if (modifier.isAbstract) modifiers.isAbstract = true;
                    else if (modifier.visibility)
                        modifiers.visibility = modifier.visibility;
                }

            const classModel = new Class(
                this.currentPackage + classDeclaration.className,
                classDeclaration.extends,
                classDeclaration.implements,
                classDeclaration.attributes,
                classDeclaration.methods,
                modifiers.isAbstract,
                modifiers.visibility
            );

            this.structure.addClass(classModel);
        } else if (ctx.enumDeclaration) {
            const enumModel = this.enumDeclaration(
                ctx.enumDeclaration[0].children
            );

            this.structure.addEnum(enumModel);
        }
    }

    classModifier(ctx: ClassModifierCtx) {
        let visibleType: VisibleType;

        if (ctx.Private) visibleType = VisibleType.Private;
        else if (ctx.Protected) visibleType = VisibleType.Protected;
        else visibleType = VisibleType.Public;

        return {
            isAbstract: !!ctx.Abstract,
            visibility: visibleType
        };
    }

    normalClassDeclaration(ctx: NormalClassDeclarationCtx) {
        const className = this.typeIdentifier(ctx.typeIdentifier[0].children);
        const classBody = this.classBody(ctx.classBody[0].children, className);

        let implementsArray: string[] = [];

        if (ctx.superinterfaces)
            implementsArray = this.superinterfaces(
                ctx.superinterfaces[0].children
            );

        return {
            className,
            methods: classBody?.methods,
            attributes: classBody?.attributes,
            extends: ctx.superclass
                ? this.superclass(ctx.superclass[0].children)
                : undefined,
            implements: implementsArray
        };
    }

    superclass(ctx: SuperclassCtx) {
        return this.classType(ctx.classType[0].children);
    }

    superinterfaces(ctx: SuperinterfacesCtx) {
        return this.interfaceTypeList(ctx.interfaceTypeList[0].children);
    }

    classBody(ctx: ClassBodyCtx, className: string): ClassMembers {
        const classBodyDeclarationList = ctx.classBodyDeclaration;
        const classMembers: ClassMembers = {
            methods: new Map(),
            attributes: new Map()
        };

        if (classBodyDeclarationList) {
            for (const {
                children: classBodyDeclaration
            } of classBodyDeclarationList) {
                const declaration = this.classBodyDeclaration(
                    classBodyDeclaration,
                    className
                );

                if (declaration instanceof Method)
                    classMembers.methods.set(declaration.name, declaration);
                else if (declaration instanceof Attribute)
                    classMembers.attributes.set(declaration.name, declaration);
                else if (declaration instanceof Association)
                    this.structure.addAssociation(declaration);
            }
        }

        return classMembers;
    }

    classBodyDeclaration(ctx: ClassBodyDeclarationCtx, className: string) {
        const classMemberDeclaration = ctx.classMemberDeclaration?.[0].children;

        if (!classMemberDeclaration) return;

        return this.classMemberDeclaration(classMemberDeclaration, className);
    }

    classMemberDeclaration(
        ctx: ClassMemberDeclarationCtx,
        className: string
    ): Method | Attribute | Association | undefined {
        if (ctx.fieldDeclaration) {
            // Field
            const attribute = this.fieldDeclaration(
                ctx.fieldDeclaration[0].children,
                className
            );

            return attribute;
        } else if (ctx.methodDeclaration) {
            // Method
            const method = this.methodDeclaration(
                ctx.methodDeclaration[0].children
            );

            return method;
        }

        return undefined;
    }

    /*
        INTERFACE
    */

    interfaceDeclaration(ctx: InterfaceDeclarationCtx) {
        const normalInterfaceDeclaration =
            ctx.normalInterfaceDeclaration?.[0].children;

        let visibility = VisibleType.Public;

        if (!normalInterfaceDeclaration) return;

        const { name, methods } = this.normalInterfaceDeclaration(
            normalInterfaceDeclaration
        );

        if (ctx.interfaceModifier) {
            for (const {
                children: interfaceModifier
            } of ctx.interfaceModifier) {
                const visibilityModifier =
                    this.interfaceModifier(interfaceModifier);

                if (visibilityModifier) visibility = visibilityModifier;
            }
        }

        this.structure.addInterface(
            new Interface(this.currentPackage + name, methods, visibility)
        );
    }

    normalInterfaceDeclaration(ctx: NormalInterfaceDeclarationCtx) {
        return {
            name: this.typeIdentifier(ctx.typeIdentifier[0].children),
            methods: this.interfaceBody(ctx.interfaceBody[0].children)
        };
    }

    interfaceBody(ctx: InterfaceBodyCtx) {
        const methods = new Map<string, Method>();

        if (ctx.interfaceMemberDeclaration?.length) {
            for (const {
                children: interfaceMemberDeclaration
            } of ctx.interfaceMemberDeclaration) {
                const method = this.interfaceMemberDeclaration(
                    interfaceMemberDeclaration
                );

                if (method) methods.set(method.name, method);
            }
        }

        return methods;
    }

    interfaceMemberDeclaration(ctx: InterfaceMemberDeclarationCtx) {
        if (!ctx.interfaceMethodDeclaration) return;

        return this.interfaceMethodDeclaration(
            ctx.interfaceMethodDeclaration[0].children
        );
    }

    interfaceMethodDeclaration(ctx: InterfaceMethodDeclarationCtx) {
        const { name, result, parameters } = this.methodHeader(
            ctx.methodHeader[0].children
        );
        const modifiers = {
            visibility: VisibleType.Public,
            isAbstract: false,
            isStatic: false
        };

        if (ctx.interfaceMethodModifier)
            for (const {
                children: interfaceMethodModifier
            } of ctx.interfaceMethodModifier) {
                const modifier = this.interfaceMethodModifier(
                    interfaceMethodModifier
                );

                if (modifier.visibility)
                    modifiers.visibility = modifier.visibility;
                else if (modifier.isAbstrat)
                    modifiers.isAbstract = modifier.isAbstrat;
                else if (modifier.isStatic)
                    modifiers.isStatic = modifier.isStatic;
            }

        return new Method(
            name,
            result,
            parameters,
            modifiers.visibility,
            modifiers.isAbstract,
            modifiers.isStatic
        );
    }

    interfaceMethodModifier(ctx: InterfaceMethodModifierCtx) {
        let visibility: VisibleType | undefined;

        if (ctx.Private) visibility = VisibleType.Private;
        else if (ctx.Public) visibility = VisibleType.Public;

        return {
            visibility,
            isAbstrat: !!ctx.Abstract,
            isStatic: !!ctx.Static
        };
    }

    interfaceModifier(ctx: InterfaceModifierCtx): VisibleType | undefined {
        if (ctx.Private) return VisibleType.Private;
        else if (ctx.Protected) return VisibleType.Protected;
        else if (ctx.Public) return VisibleType.Public;

        return undefined;
    }

    /*
        ENUM
    */

    enumDeclaration(ctx: EnumDeclarationCtx) {
        const name = this.typeIdentifier(ctx.typeIdentifier[0].children);

        if (ctx.superinterfaces) {
            const interfaces = this.superinterfaces(
                ctx.superinterfaces[0].children
            );

            // Yes, enums can implements interfaces ;)
            for (const interfaceName of interfaces) {
                this.structure.addAssociation(
                    new Association(
                        name,
                        interfaceName,
                        '-->',
                        MultiplicityType.NotSpecified,
                        MultiplicityType.NotSpecified
                    )
                );
            }
        }

        const properties = this.enumBody(ctx.enumBody[0].children);

        return new Enum(this.currentPackage + name, properties);
    }

    enumBody(ctx: EnumBodyCtx) {
        let properties = new Map<string, EnumProperty>();

        if (ctx.enumConstantList) {
            properties = this.enumConstantList(
                ctx.enumConstantList[0].children
            );
        }

        return properties;
    }

    enumConstantList(ctx: EnumConstantListCtx) {
        const properties = new Map<string, EnumProperty>();

        for (const { children: enumConstant } of ctx.enumConstant) {
            const enumModel = this.enumConstant(enumConstant);
            properties.set(enumModel.name, enumModel);
        }

        return properties;
    }

    enumConstant(ctx: EnumConstantCtx) {
        return new EnumProperty(ctx.Identifier[0].image);
    }

    /*
        FIELDS
    */
    fieldDeclaration(ctx: FieldDeclarationCtx, className: string) {
        const type = this.unannType(ctx.unannType[0].children);
        const name = this.variableDeclaratorList(
            ctx.variableDeclaratorList[0].children
        );

        const associationClass = this.getAssociationClass(
            ctx.unannType[0].children
        );

        if (associationClass) {
            return new Association(
                this.currentPackage + className,
                associationClass,
                '-->',
                MultiplicityType.Many,
                MultiplicityType.NotSpecified,
                name
            );
        } else {
            const fieldModifier = ctx.fieldModifier;
            const modifiers = {
                isStatic: false,
                visibility: VisibleType.Public
            };

            if (fieldModifier)
                for (const { children: modifier } of fieldModifier) {
                    const modifierValue = this.fieldModifier(modifier);

                    if (modifierValue.isStatic) modifiers.isStatic = true;
                    else if (modifierValue.visibility)
                        modifiers.visibility = modifierValue.visibility;
                }

            return new Attribute(
                name,
                type || 'UnknownType',
                modifiers.visibility,
                modifiers.isStatic
            );
        }
    }

    getAssociationClass(ctx: UnannTypeCtx): string | undefined {
        if (ctx.unannPrimitiveTypeWithOptionalDimsSuffix) {
            if (ctx.unannPrimitiveTypeWithOptionalDimsSuffix[0].children.dims) {
                return this.unannPrimitiveType(
                    ctx.unannPrimitiveTypeWithOptionalDimsSuffix[0].children
                        .unannPrimitiveType[0].children
                );
            }
        } else if (ctx.unannReferenceType) {
            if (ctx.unannReferenceType[0].children.dims) {
                return this.unannClassOrInterfaceType(
                    ctx.unannReferenceType[0].children
                        .unannClassOrInterfaceType[0].children
                );
            } else {
                const unannClassType =
                    ctx.unannReferenceType[0].children
                        .unannClassOrInterfaceType[0].children.unannClassType[0]
                        .children;

                const unannClassTypeStr = this.unannClassType(unannClassType);

                if (
                    unannClassType.typeArguments &&
                    unannClassTypeStr.startsWith('ArrayList')
                ) {
                    return this.typeArguments(
                        unannClassType.typeArguments[0].children
                    );
                }
            }
        }
        return;
    }

    fieldModifier(ctx: FieldModifierCtx) {
        let visibility;

        if (ctx.Private) {
            visibility = VisibleType.Private;
        } else if (ctx.Protected) {
            visibility = VisibleType.Protected;
        } else {
            visibility = VisibleType.Public;
        }

        return {
            visibility,
            isStatic: !!ctx.Static
        };
    }

    /*
        METHODS
    */
    methodDeclaration(ctx: MethodDeclarationCtx): Method {
        const { name, result, parameters } = this.methodHeader(
            ctx.methodHeader[0].children
        );
        const modifiers = {
            isAbstract: false,
            isStatic: false,
            visibility: VisibleType.Public
        };

        if (ctx.methodModifier)
            for (const { children: modifier } of ctx.methodModifier) {
                const modifierValue = this.methodModifier(modifier);

                if (modifierValue.isStatic) modifiers.isStatic = true;
                if (modifierValue.isAbstract) modifiers.isAbstract = true;
                else if (modifierValue.visibility)
                    modifiers.visibility = modifierValue.visibility;
            }

        return new Method(
            name,
            result || 'void',
            parameters,
            modifiers.visibility,
            modifiers.isAbstract,
            modifiers.isStatic
        );
    }

    methodModifier(ctx: MethodModifierCtx) {
        let visibility;

        if (ctx.Private) {
            visibility = VisibleType.Private;
        } else if (ctx.Protected) {
            visibility = VisibleType.Protected;
        } else {
            visibility = VisibleType.Public;
        }

        return {
            visibility,
            isStatic: !!ctx.Static,
            isAbstract: !!ctx.Abstract
        };
    }

    methodHeader(ctx: MethodHeaderCtx) {
        const { name, parameters } = this.methodDeclarator(
            ctx.methodDeclarator[0].children
        );

        return {
            name,
            result: this.result(ctx.result[0].children),
            parameters
        };
    }

    methodDeclarator(ctx: MethodDeclaratorCtx) {
        let parameters: Parameter[] = [];
        if (ctx.formalParameterList) {
            parameters = this.formalParameterList(
                ctx.formalParameterList[0].children
            );
        }

        return { name: ctx.Identifier[0].image, parameters };
    }

    result(ctx: ResultCtx) {
        if (ctx.unannType) {
            return this.unannType(ctx.unannType[0].children);
        }
        return ctx.Void?.[0].image;
    }

    /*
        VARIABLES
    */

    variableDeclaratorList(ctx: VariableDeclaratorListCtx) {
        return this.variableDeclarator(ctx.variableDeclarator[0].children);
    }

    variableDeclarator(ctx: VariableDeclaratorCtx) {
        return this.variableDeclaratorId(ctx.variableDeclaratorId[0].children);
    }

    variableDeclaratorId(ctx: VariableDeclaratorIdCtx) {
        return ctx.Identifier[0].image;
    }

    formalParameterList(ctx: FormalParameterListCtx) {
        const parameters: Parameter[] = [];
        for (const { children: formalParameter } of ctx.formalParameter) {
            const parameter = this.formalParameter(formalParameter);

            if (parameter) parameters.push(parameter);
        }

        return parameters;
    }

    formalParameter(ctx: FormalParameterCtx) {
        let parameter: Parameter | undefined;

        if (ctx.variableParaRegularParameter) {
            parameter = this.variableParaRegularParameter(
                ctx.variableParaRegularParameter[0].children
            );
        } else if (ctx.variableArityParameter) {
            parameter = this.variableArityParameter(
                ctx.variableArityParameter[0].children
            );
        }

        return parameter;
    }

    variableParaRegularParameter(ctx: VariableParaRegularParameterCtx) {
        return new Parameter(
            this.variableDeclaratorId(ctx.variableDeclaratorId[0].children),
            this.unannType(ctx.unannType[0].children) || 'UnknownType'
        );
    }

    variableArityParameter(ctx: VariableArityParameterCtx) {
        return new Parameter(
            ctx.Identifier[0].image,
            this.unannType(ctx.unannType[0].children) || 'UnknownType'
        );
    }

    /*
        TYPES
    */

    interfaceTypeList(ctx: InterfaceTypeListCtx) {
        const implementsArray: string[] = [];

        for (const { children: implement } of ctx.interfaceType) {
            implementsArray.push(this.interfaceType(implement));
        }

        return implementsArray;
    }

    interfaceType(ctx: InterfaceTypeCtx) {
        return this.classType(ctx.classType[0].children);
    }

    typeParameter(ctx: TypeParameterCtx) {
        return this.typeIdentifier(ctx.typeIdentifier[0].children);
    }

    typeIdentifier(ctx: TypeIdentifierCtx) {
        return ctx.Identifier[0].image;
    }

    classType(ctx: ClassTypeCtx) {
        return ctx.Identifier.map((i) => i.image).join('.');
    }

    unannType(ctx: UnannTypeCtx) {
        if (ctx.unannPrimitiveTypeWithOptionalDimsSuffix) {
            return this.unannPrimitiveTypeWithOptionalDimsSuffix(
                ctx.unannPrimitiveTypeWithOptionalDimsSuffix[0].children
            );
        } else if (ctx.unannReferenceType) {
            return this.unannReferenceType(ctx.unannReferenceType[0].children);
        }
        return undefined;
    }

    unannPrimitiveTypeWithOptionalDimsSuffix(
        ctx: UnannPrimitiveTypeWithOptionalDimsSuffixCtx
    ) {
        const type = this.unannPrimitiveType(
            ctx.unannPrimitiveType[0].children
        );
        return type ? type + this.dims(ctx.dims?.[0].children) : undefined;
    }

    unannPrimitiveType(ctx: UnannPrimitiveTypeCtx) {
        if (ctx.Boolean) {
            return ctx.Boolean[0].image;
        } else if (ctx.numericType) {
            return this.numericType(ctx.numericType[0].children);
        }
    }

    numericType(ctx: NumericTypeCtx) {
        if (ctx.floatingPointType) {
            return this.floatingPointType(ctx.floatingPointType[0].children);
        } else if (ctx.integralType) {
            return this.integralType(ctx.integralType[0].children);
        }
    }

    floatingPointType(ctx: FloatingPointTypeCtx) {
        return ctx.Double?.[0].image || ctx.Float?.[0].image;
    }

    integralType(ctx: IntegralTypeCtx) {
        return (
            ctx.Byte?.[0].image ||
            ctx.Char?.[0].image ||
            ctx.Int?.[0].image ||
            ctx.Long?.[0].image ||
            ctx.Short?.[0].image
        );
    }

    unannReferenceType(ctx: UnannReferenceTypeCtx) {
        return (
            this.unannClassOrInterfaceType(
                ctx.unannClassOrInterfaceType[0].children
            ) + this.dims(ctx.dims?.[0].children)
        );
    }

    unannClassOrInterfaceType(ctx: UnannClassOrInterfaceTypeCtx) {
        return this.unannClassType(ctx.unannClassType[0].children);
    }

    unannClassType(ctx: UnannClassTypeCtx) {
        const suffix = ctx.typeArguments
            ? '<' + this.typeArguments(ctx.typeArguments[0].children) + '>'
            : '';

        return ctx.Identifier.map((i) => i.image).join('.') + suffix;
    }

    typeArguments(ctx: TypeArgumentsCtx) {
        return this.typeArgumentList(ctx.typeArgumentList[0].children);
    }

    typeArgumentList(ctx: TypeArgumentListCtx) {
        return ctx.typeArgument
            .map((a) => this.typeArgument(a.children))
            .join(', ');
    }

    typeArgument(ctx: TypeArgumentCtx) {
        if (ctx.referenceType)
            return this.referenceType(ctx.referenceType?.[0].children);
        else return undefined;
    }

    referenceType(ctx: ReferenceTypeCtx) {
        if (ctx.classOrInterfaceType)
            return (
                this.classOrInterfaceType(
                    ctx.classOrInterfaceType[0].children
                ) + this.dims(ctx.dims?.[0].children)
            );
        else if (ctx.primitiveType) {
            const type = this.primitiveType(ctx.primitiveType[0].children);
            return type ? type + this.dims(ctx.dims?.[0].children) : undefined;
        }
    }

    primitiveType(ctx: PrimitiveTypeCtx) {
        if (ctx.Boolean) return ctx.Boolean[0].image;
        else if (ctx.numericType)
            return this.numericType(ctx.numericType[0].children);
    }

    classOrInterfaceType(ctx: ClassOrInterfaceTypeCtx) {
        return this.classType(ctx.classType[0].children);
    }

    dims(ctx: DimsCtx | undefined) {
        return ctx ? new Array(ctx.LSquare.length).fill('[]').join('') : '';
    }
}
