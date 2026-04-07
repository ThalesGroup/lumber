export class UMLType {
    public static TYPE = /(\w+(?:(?:<[^>]+>)|(?:\[\w*\]))?)/;
    public static TYPE_VARIABLE = new RegExp(
        `(?:${UMLType.TYPE.source} +(\\w+))`
    );
    public static VARIABLE_TYPE = new RegExp(
        `(?:(\\w+)\\s*:\\s*${UMLType.TYPE.source})`
    );
    public static METHOD = new RegExp(
        `(?:${UMLType.TYPE.source} +)?(\\w+)\\s*\\((.*)\\)`
    );

    public static VISIBILITY = /([-#+~])?/;
    public static MODIFIERS = /\{(\w+)\}/g;

    public static BODY = /(?:{(?:(?:{[^}]+})|[^}])+})/;

    public static INTERFACE = new RegExp(
        `interface\\s+(\\w+)\\s*${UMLType.BODY.source}?`,
        'g'
    );
    public static CLASS = new RegExp(
        `class\\s+(\\w+)\\s*(extends\\s+\\w+\\s*)?(implements\\s+[\\w,\\s]+\\s*)?${UMLType.BODY.source}?`,
        'g'
    );
    public static ENUM = new RegExp(
        `enum\\s+(\\w+)\\s*${UMLType.BODY.source}?`,
        'g'
    );

    public static TYPE_ATTRIBUTE = new RegExp(
        `^\\s*${UMLType.VISIBILITY.source}\\s*${UMLType.TYPE_VARIABLE.source}\\s*$`
    ); // Visibility Type AttributeName
    public static ATTRIBUTE_TYPE = new RegExp(
        `^\\s*${UMLType.VISIBILITY.source}\\s*${UMLType.VARIABLE_TYPE.source}\\s*$`
    ); // Visibility AttributeName : Type
    public static METHOD_TYPE = new RegExp(
        `^\\s*${UMLType.VISIBILITY.source}\\s*(\\w+)\\s*\\((.*)\\)\\s*:\\s*${UMLType.TYPE.source}\\s*$`
    ); // Visibility MethodName(Params) : Type
    public static TYPE_METHOD = new RegExp(
        `^\\s*${UMLType.VISIBILITY.source}\\s*${UMLType.METHOD.source}\\s*$`
    ); // Visibility Type MethodName(Params)
    public static PARAMETERS = new RegExp(
        `(?:${UMLType.TYPE_VARIABLE.source}\\s*,)|(?:,?\\s*${UMLType.VARIABLE_TYPE.source}\\s*,)`,
        'g'
    ); // ParamName : Type || Type ParamName
    public static INLINE_ATTRIBUTES = new RegExp(
        `^\\s*${UMLType.VISIBILITY.source}\\s*(\\w+)\\s*:\\s*${UMLType.TYPE_VARIABLE.source}\\s*$`,
        'gm'
    );
    public static INLINE_METHODS = new RegExp(
        `^\\s*${UMLType.VISIBILITY.source}\\s*(\\w+)\\s*:\\s*${UMLType.METHOD.source}\\s*$`,
        'gm'
    );
    public static ENUM_PROPERTY = /\s*([\w_\d]+)(?:\s*[=:]\s*([\w_\d]+))?/;

    // ASSOCIATION
    public static OPERANDE1 = new RegExp(`(\\w+)\\s+(?:"([*.\\w]+)"\\s+)?`);
    public static OPERANDE2 = new RegExp(`(?:\\s+"([*.\\w]+)")? +(\\w+)`);

    public static COMPOSITION_L_TO_R = /[*o]-+>?/;
    public static COMPOSITION_R_TO_L = /<?-+[*o]/;

    public static COMPOSITION = new RegExp(
        `${UMLType.OPERANDE1.source}((?:${UMLType.COMPOSITION_L_TO_R.source})|(?:${UMLType.COMPOSITION_R_TO_L.source}))${UMLType.OPERANDE2.source}(?:\\s*:\\s*([\\s\\w]+))?\\s*$`,
        'gm'
    );
    public static ASSOCIATION = new RegExp(
        `${UMLType.OPERANDE1.source}-+${UMLType.OPERANDE2.source}(?:\\s*:\\s*([\\s\\w]+))?\\s*$`,
        'gm'
    );
}

export interface Modifiers {
    abstract: boolean;
    static: boolean;
    field: boolean;
    method: boolean;
}

export enum VisibleType {
    Public = 'public',
    Private = 'private',
    Protected = 'protected'
}

export const VISIBLE_TYPES = new Map<string, VisibleType>([
    ['+', VisibleType.Public],
    ['-', VisibleType.Private],
    ['#', VisibleType.Protected]
]);

export const VISIBLE_TYPES_TO_UML = new Map<VisibleType, string>([
    [VisibleType.Public, '+'],
    [VisibleType.Private, '-'],
    [VisibleType.Protected, '#']
]);
