import { UMLTranslator } from '../UMLTranslator';
import {
    Association,
    Attribute,
    Class,
    Enum,
    EnumProperty,
    Method,
    MultiplicityType,
    Parameter,
    UMLStructure,
    VisibleType
} from '../datamodel';

describe('UML Translator', () => {
    it('should translate a datamodel', () => {
        const translator = new UMLTranslator();
        const datamodel = new UMLStructure();
        const class1 = new Class(
            'Class1',
            'ExtendClass',
            ['interface1'],
            undefined,
            undefined,
            true,
            VisibleType.Private
        );
        const interface1 = new Class('Interface1');
        const enum1 = new Enum('Enum1');
        const enum2 = new Enum('Enum2');

        class1.addAttribute(new Attribute('attr1', 'String'));
        class1.addAttribute(
            new Attribute('attr1', 'String', VisibleType.Protected, true)
        );
        class1.addMethod(
            new Method(
                'met1',
                'String',
                [
                    new Parameter('param1', 'Integer'),
                    new Parameter('param2', 'Boolean')
                ],
                VisibleType.Private,
                true,
                true
            )
        );
        class1.addMethod(new Method('met2'));
        datamodel.addClass(class1);

        interface1.addMethod(
            new Method('met1', 'String', [
                new Parameter('param1', 'Integer'),
                new Parameter('param2', 'Boolean')
            ])
        );
        datamodel.addInterface(interface1);

        enum1.addProperty(new EnumProperty('prop1'));
        enum1.addProperty(new EnumProperty('prop2', '1'));
        datamodel.addEnum(enum1);
        datamodel.addEnum(enum2);

        datamodel.addAssociation(
            new Association(
                'Class1',
                'Class2',
                '-->',
                MultiplicityType.One,
                MultiplicityType.One,
                'extends'
            )
        );
        datamodel.addAssociation(
            new Association(
                'Class2',
                'Class3',
                '<--',
                MultiplicityType.One,
                MultiplicityType.One
            )
        );

        expect(translator.translateAll(datamodel)).toMatchSnapshot();
    });
});
