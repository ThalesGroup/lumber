import {
    Association,
    Attribute,
    Class,
    Enum,
    EnumProperty,
    Method,
    MultiplicityType,
    Parameter,
    VisibleType,
    Interface,
    UMLStructure
} from '../datamodel';

describe('DataModel', () => {
    describe('Class', () => {
        it('should create a Class', () => {
            const myClass = new Class('class01');

            expect(myClass.name).toEqual('class01');
        });

        it('should create a Class with an extend', () => {
            const myClass = new Class('class01', 'class02');

            expect(myClass.name).toEqual('class01');
            expect(myClass.extends).toEqual('class02');
        });

        it('should create a Class with an implement', () => {
            const myClass = new Class('class01', undefined, [
                'interface01',
                'interface02'
            ]);

            expect(myClass.name).toEqual('class01');
            expect(myClass.implements).toStrictEqual([
                'interface01',
                'interface02'
            ]);
        });

        describe('#methods', () => {
            it('should add an attribute', () => {
                const myClass = new Class('class01');

                myClass.addAttribute(new Attribute('attr01', 'string'));
                myClass.addAttribute(new Attribute('attr02', 'boolean'));
                myClass.addAttribute(new Attribute('attr02', 'boolean'));

                expect(myClass.attributes.size).toEqual(2);
            });

            it('should add a method', () => {
                const myClass = new Class('class01');

                myClass.addMethod(new Method('met01', 'string'));

                expect(myClass.methods.size).toEqual(1);
            });
        });
    });

    describe('Association', () => {
        it('should create a basic association', () => {
            const myAsso = new Association('classLeft', 'classRight');

            expect(myAsso.leftClass).toEqual('classLeft');
            expect(myAsso.rightClass).toEqual('classRight');
            expect(myAsso.leftToRightAssociation).toBe(
                MultiplicityType.NotSpecified
            );
            expect(myAsso.rightToLeftAssociation).toBe(
                MultiplicityType.NotSpecified
            );
            expect(myAsso.name).toEqual('');
        });

        it('should create a complete association', () => {
            const myAsso = new Association(
                'classLeft',
                'classRight',
                undefined,
                MultiplicityType.Many,
                MultiplicityType.One,
                'My Awesome Association'
            );

            expect(myAsso.leftClass).toEqual('classLeft');
            expect(myAsso.rightClass).toEqual('classRight');
            expect(myAsso.leftToRightAssociation).toBe(MultiplicityType.Many);
            expect(myAsso.rightToLeftAssociation).toBe(MultiplicityType.One);
            expect(myAsso.name).toEqual('My Awesome Association');
        });
    });

    describe('Enum', () => {
        it('should create an enum', () => {
            const myEnum = new Enum('enum01');

            expect(myEnum.name).toEqual('enum01');
        });

        it('should create with some properties', () => {
            const enumProperties = new Map([
                ['Prop1', new EnumProperty('Prop1', '1')],
                ['Prop2', new EnumProperty('Prop2', '2')],
                ['Prop3', new EnumProperty('Prop3', '3')]
            ]);
            const myEnum = new Enum('enum01', enumProperties);

            expect(myEnum.name).toEqual('enum01');
            expect(myEnum.properties.size).toEqual(3);
            expect([...myEnum.properties.values()]).toStrictEqual([
                new EnumProperty('Prop1', '1'),
                new EnumProperty('Prop2', '2'),
                new EnumProperty('Prop3', '3')
            ]);
        });

        describe('#methods', () => {
            it('should add a property', () => {
                const myProp = new EnumProperty('Prop1', '1');
                const myEnum = new Enum('enum01');

                myEnum.addProperty(myProp);

                expect(myEnum.name).toEqual('enum01');
                expect(myEnum.properties.size).toEqual(1);
                expect(myEnum.properties.get('Prop1')).toBe(myProp);
            });

            it('should add some properties', () => {
                const prop1 = new EnumProperty('Prop1', '1');
                const prop2 = new EnumProperty('Prop2', '2');
                const prop3 = new EnumProperty('Prop2', '3');
                const myEnum = new Enum('enum01');

                myEnum.addProperty(prop1);
                myEnum.addProperty(prop2);
                myEnum.addProperty(prop3);

                expect(myEnum.name).toEqual('enum01');
                expect(myEnum.properties.size).toEqual(2);
                expect(myEnum.properties.get('Prop1')).toBe(prop1);
                expect(myEnum.properties.get('Prop2')).toBe(prop3);
            });
        });
    });

    describe('Method', () => {
        it('should create a method', () => {
            const myMet = new Method('met01', 'string');

            expect(myMet.name).toEqual('met01');
            expect(myMet.returnType).toEqual('string');
        });

        it('should create a method with parameters', () => {
            const param1 = new Parameter('param01', 'boolean');
            const param2 = new Parameter('param02', 'number');
            const myMet = new Method('met01', 'string', [param1, param2]);

            expect(myMet.name).toEqual('met01');
            expect(myMet.returnType).toEqual('string');
            expect(myMet.parameters[0]).toBe(param1);
            expect(myMet.parameters[1]).toBe(param2);
        });

        it('should create a private method', () => {
            const myMet = new Method(
                'met01',
                'string',
                undefined,
                VisibleType.Private
            );

            expect(myMet.name).toEqual('met01');
            expect(myMet.returnType).toEqual('string');
            expect(myMet.visibility).toBe(VisibleType.Private);
        });

        it('should create an abstract method', () => {
            const myMet = new Method(
                'met01',
                'string',
                undefined,
                undefined,
                true
            );

            expect(myMet.name).toEqual('met01');
            expect(myMet.returnType).toEqual('string');
            expect(myMet.isAbstract).toBeTruthy();
        });

        it('should create a static method', () => {
            const myMet = new Method(
                'met01',
                'string',
                undefined,
                undefined,
                undefined,
                true
            );

            expect(myMet.name).toEqual('met01');
            expect(myMet.returnType).toEqual('string');
            expect(myMet.isStatic).toBeTruthy();
        });

        describe('#methods', () => {
            it('should add a parameter', () => {
                const myParam = new Parameter('param1', 'Map<string, boolean>');
                const myMet = new Method('met01', 'boolean');

                myMet.addParameter(myParam);

                expect(myMet.name).toEqual('met01');
                expect(myMet.returnType).toEqual('boolean');
                expect(myMet.parameters.length).toEqual(1);
                expect(myMet.parameters[0]).toBe(myParam);
            });

            it('should add some parameters', () => {
                const param1 = new Parameter('param1', 'Map<string, boolean>');
                const param2 = new Parameter('param2', 'string');
                const param3 = new Parameter('param3', 'boolean');
                const myMet = new Method('met01', 'boolean');

                myMet.addParameters([param1, param2, param3]);

                expect(myMet.name).toEqual('met01');
                expect(myMet.returnType).toEqual('boolean');
                expect(myMet.parameters.length).toEqual(3);
                expect(myMet.parameters[0]).toBe(param1);
                expect(myMet.parameters[1]).toBe(param2);
                expect(myMet.parameters[2]).toBe(param3);
            });

            it('should build parameters from "type param"', () => {
                const myMet = new Method('met01', 'boolean');

                myMet.buildParametersFrom(
                    '  string  param1,   boolean   param2 '
                );

                expect(myMet.name).toEqual('met01');
                expect(myMet.returnType).toEqual('boolean');
                expect(myMet.parameters.length).toEqual(2);
                let param = myMet.parameters[0];
                expect(param).toBeDefined();
                expect(param.name).toEqual('param1');
                expect(param.type).toEqual('string');
                param = myMet.parameters[1];
                expect(param).toBeDefined();
                expect(param.name).toEqual('param2');
                expect(param.type).toEqual('boolean');
            });

            it('should build parameters from "param : type"', () => {
                const myMet = new Method('met01', 'boolean');

                myMet.buildParametersFrom(
                    ' param1 : string  ,  param2:   boolean    '
                );

                expect(myMet.name).toEqual('met01');
                expect(myMet.returnType).toEqual('boolean');
                expect(myMet.parameters.length).toEqual(2);
                let param = myMet.parameters[0];
                expect(param).toBeDefined();
                expect(param.name).toEqual('param1');
                expect(param.type).toEqual('string');
                param = myMet.parameters[1];
                expect(param).toBeDefined();
                expect(param.name).toEqual('param2');
                expect(param.type).toEqual('boolean');
            });
        });
    });

    describe('Parameter', () => {
        it('should create a parameter', () => {
            const myParam = new Parameter('param1', 'boolean');

            expect(myParam.name).toEqual('param1');
            expect(myParam.type).toEqual('boolean');
        });

        describe('#methods', () => {
            it('should return the parameter as a string', () => {
                const myParam = new Parameter('param1', 'boolean');

                expect(myParam.name).toEqual('param1');
                expect(myParam.type).toEqual('boolean');
                expect(myParam.toString()).toEqual('boolean param1');
            });
        });
    });

    describe('Interface', () => {
        it('should create an interface', () => {
            const myInterface = new Interface('interface1');

            expect(myInterface.name).toEqual('interface1');
        });

        it('should create a private interface', () => {
            const myInterface = new Interface(
                'interface1',
                undefined,
                VisibleType.Private
            );

            expect(myInterface.name).toEqual('interface1');
            expect(myInterface.visibility).toBe(VisibleType.Private);
        });

        it('should create an interface with methods', () => {
            const methods = new Map([['met1', new Method('met1', 'string')]]);
            const myInterface = new Interface('interface1', methods);

            expect(myInterface.name).toEqual('interface1');
            expect(myInterface.methods.size).toEqual(1);
        });

        describe('#methods', () => {
            it('should add a method', () => {
                const myMet = new Method('met1', 'string');
                const myInterface = new Interface('interface1');

                myInterface.addMethod(myMet);

                expect(myInterface.name).toEqual('interface1');
                expect(myInterface.methods.size).toEqual(1);
                expect(myInterface.methods.get('met1')).toBe(myMet);
            });
        });
    });

    describe('UMLStructure', () => {
        it('should create an UMLStructure', () => {
            const umlStruct = new UMLStructure();

            expect(umlStruct.classes.size).toEqual(0);
            expect(umlStruct.interfaces.size).toEqual(0);
            expect(umlStruct.enums.size).toEqual(0);
        });

        it('should create an UMLStructure with some classes', () => {
            const class1 = new Class('class01');
            const class2 = new Class('class02');
            const umlStruct = new UMLStructure(
                new Map([
                    ['class01', class1],
                    ['class02', class2]
                ])
            );

            expect(umlStruct.classes.size).toEqual(2);
            expect(umlStruct.classes.get('class01')).toBe(class1);
            expect(umlStruct.classes.get('class02')).toBe(class2);
        });

        it('should create an UMLStructure with some interfaces', () => {
            const interface1 = new Interface('interface01');
            const interface2 = new Interface('interface02');
            const umlStruct = new UMLStructure(
                undefined,
                new Map([
                    ['interface01', interface1],
                    ['interface02', interface2]
                ])
            );

            expect(umlStruct.interfaces.size).toEqual(2);
            expect(umlStruct.interfaces.get('interface01')).toBe(interface1);
            expect(umlStruct.interfaces.get('interface02')).toBe(interface2);
        });

        it('should create an UMLStructure with some interfaces', () => {
            const enum1 = new Enum('enum01');
            const enum2 = new Enum('enum02');
            const umlStruct = new UMLStructure(
                undefined,
                undefined,
                new Map([
                    ['enum01', enum1],
                    ['enum02', enum2]
                ])
            );

            expect(umlStruct.enums.size).toEqual(2);
            expect(umlStruct.enums.get('enum01')).toBe(enum1);
            expect(umlStruct.enums.get('enum02')).toBe(enum2);
        });

        it('should create an UMLStructure with some associations', () => {
            const asso1 = new Association('class01', 'class02');
            const asso2 = new Association('class01', 'class03');
            const umlStruct = new UMLStructure(
                undefined,
                undefined,
                undefined,
                [asso1, asso2]
            );

            expect(umlStruct.associations.length).toEqual(2);
            expect(umlStruct.associations[0]).toBe(asso1);
            expect(umlStruct.associations[1]).toBe(asso2);
        });

        describe('#methods', () => {
            it('should add some classes', () => {
                const umlStruct = new UMLStructure();
                const class1 = new Class('class01');
                const class2 = new Class('class02');

                umlStruct.addClass(class1);
                umlStruct.addClass(class1);
                umlStruct.addClass(class2);

                expect(umlStruct.classes.size).toEqual(2);
                expect(umlStruct.classes.get('class01')).toBe(class1);
                expect(umlStruct.classes.get('class02')).toBe(class2);
            });

            it('should add some interfaces', () => {
                const umlStruct = new UMLStructure();
                const interface1 = new Interface('interface01');
                const interface2 = new Interface('interface02');

                umlStruct.addInterface(interface1);
                umlStruct.addInterface(interface1);
                umlStruct.addInterface(interface2);

                expect(umlStruct.interfaces.size).toEqual(2);
                expect(umlStruct.interfaces.get('interface01')).toBe(
                    interface1
                );
                expect(umlStruct.interfaces.get('interface02')).toBe(
                    interface2
                );
            });

            it('should add some enums', () => {
                const umlStruct = new UMLStructure();
                const enum1 = new Enum('enum01');
                const enum2 = new Enum('enum02');

                umlStruct.addEnum(enum1);
                umlStruct.addEnum(enum1);
                umlStruct.addEnum(enum2);

                expect(umlStruct.enums.size).toEqual(2);
                expect(umlStruct.enums.get('enum01')).toBe(enum1);
                expect(umlStruct.enums.get('enum02')).toBe(enum2);
            });

            it('should add some associations', () => {
                const umlStruct = new UMLStructure();
                const asso1 = new Association('class01', 'class02');
                const asso2 = new Association('class01', 'class03');

                umlStruct.addAssociation(asso1);
                umlStruct.addAssociation(asso2);

                expect(umlStruct.associations.length).toEqual(2);
                expect(umlStruct.associations[0]).toBe(asso1);
                expect(umlStruct.associations[1]).toBe(asso2);
            });
        });
    });
});
