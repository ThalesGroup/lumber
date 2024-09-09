import * as assert from 'assert';

import { umlToDatamodel } from '../utils/umltodatamodel';
import { MultiplicityType, VisibleType } from '../datamodel';

const UML_DIAGRAMS = [
    `class test01
    class test02
    class test03
    class test04 {
        - test : String
    }
    class test05`,
    //
    `class test01 {
        string[] att1
        {static} Boolean att2
        +Map<string, Integer[]> att3
        - att4 : TestClass[]
    }
        
    test01 : string att5
    test01 : {static}Map<string, Integer[]> att6`,
    //
    `class test01 {
        -string[] met1()
        + {abstract} Boolean met2(Map<string, Integer[]> p1, String p2)
        Map<string, Integer[]> met3()
        met4(String p1) : TestClass[]
    }
    
    test01 : string met5(string Test)
    test01 : {abstract} Map<string, Integer[]> met6(Map<string, Integer> p1, string p2)`,
    //
    `class test01 {
        + Map<string, Integer[]> met1(p1 : Map<string, Integer[]>, String p2)
        + met2(Map<string, Integer[]> p1, one_very_long_parameter : Integer[]) : Boolean
    }`,
    //
    `interface test01
    interface test02
    interface test03
    interface test04
    interface test05 {
        + void method(test : String)
    }`,
    //
    `interface test01 {
        + void met1(test : String)
        # void met2(test : String)
        - met3(test : String) : void
        - void met4()
    }
    
    test01 : void met5(test : String)
    test01 : Map<String, Test> met6(test : Map<String, Test>, Integer test)`
];

describe('UMLToDataModel', () => {
    describe('Class', () => {
        it('should translate 5 classes', () => {
            const umlStructure = umlToDatamodel(UML_DIAGRAMS[0]);

            assert.equal(umlStructure.classes.size, 5);
        });

        it('should translate 1 class with 6 attributes', () => {
            const umlStructure = umlToDatamodel(UML_DIAGRAMS[1]);

            assert.equal(umlStructure.classes.size, 1);
            assert.equal(
                umlStructure.classes.get('test01')?.attributes.size,
                6
            );

            let attribute = umlStructure.classes
                .get('test01')
                ?.attributes.get('att2');

            assert.equal(!!attribute, true, 'att2 should be defined');
            assert.equal(attribute?.isStatic, true, 'att2 should be static');

            attribute = umlStructure.classes
                .get('test01')
                ?.attributes.get('att6');

            if (attribute) {
                assert.equal(attribute.name, 'att6', 'last attribute name');
                assert.equal(
                    attribute.type,
                    'Map<string, Integer[]>',
                    'last attribute type'
                );
                assert.equal(
                    attribute.visibility,
                    VisibleType.Private,
                    'last attribute visibility'
                );
                assert.equal(
                    attribute.isStatic,
                    true,
                    'last attribute should be static'
                );
            } else {
                assert.fail('attribute att6 should exists');
            }
        });

        it('should translate a class with an extend', () => {
            const umlStructure = umlToDatamodel(
                `class testClass
class testExtd extends testClass`
            );

            assert.ok(umlStructure);

            const classMdl = umlStructure.classes.get('testExtd');
            assert.ok(classMdl);
            assert.equal(classMdl.extends, 'testClass');
        });

        it('should translate a class with an implement', () => {
            const umlStructure = umlToDatamodel(
                `interface testInterface
class testExtd implements testInterface`
            );

            assert.ok(umlStructure);

            const classMdl = umlStructure.classes.get('testExtd');
            assert.ok(classMdl);
            assert.deepEqual(classMdl.implements, ['testInterface']);
        });

        it('should translate a class with an extend and 3 implements', () => {
            const umlStructure = umlToDatamodel(
                `interface testInterface
interface testInterface2
interface testInterface3
class testClass
class testExtd extends testClass implements testInterface, testInterface2, testInterface3`
            );

            assert.ok(umlStructure);

            const classMdl = umlStructure.classes.get('testExtd');
            assert.ok(classMdl);
            assert.equal(classMdl.extends, 'testClass');
            assert.deepEqual(classMdl.implements, [
                'testInterface',
                'testInterface2',
                'testInterface3'
            ]);
        });

        describe('#methods', () => {
            const umlStructure = umlToDatamodel(UML_DIAGRAMS[3]);

            const methods = umlStructure.classes.get('test01')?.methods;
            let parameter;

            it('should translate 1 class with 6 methods', () => {
                const umlStructure = umlToDatamodel(UML_DIAGRAMS[2]);

                assert.equal(umlStructure.classes.size, 1);
                assert.equal(
                    umlStructure.classes.get('test01')?.methods.size,
                    6,
                    'method amount'
                );

                const methods = umlStructure.classes.get('test01')?.methods;

                assert.equal(
                    methods?.has('met2'),
                    true,
                    'met2 should be defined'
                );
                assert.equal(
                    methods?.get('met2')?.isAbstract,
                    true,
                    'met2 should be abstract'
                );

                assert.equal(
                    methods?.get('met6')?.parameters.length,
                    2,
                    'last method parameter amount'
                );
                assert.equal(
                    methods?.get('met6')?.isAbstract,
                    true,
                    'last method should be abstract'
                );
            });

            it('should translate 1 class with 2 methods having 2 parameters', () => {
                assert.equal(umlStructure.classes.size, 1, 'class amount');
                assert.equal(
                    umlStructure.classes.get('test01')?.methods.size,
                    2,
                    'methods amount'
                );

                assert.equal(
                    methods?.get('met1')?.parameters.length,
                    2,
                    'first method parameters amount'
                );
                assert.equal(
                    methods?.get('met2')?.parameters.length,
                    2,
                    'second method parameters amount'
                );
            });

            it('should have a method met1 as in the UML diagram', () => {
                // FIRST METHOD

                assert.equal(
                    methods?.get('met1')?.returnType,
                    'Map<string, Integer[]>',
                    '[first method] invalid return type'
                );

                parameter = methods?.get('met1')?.parameters[0];

                assert.equal(
                    parameter?.name,
                    'p1',
                    '[first method] first paramater name'
                );
                assert.equal(
                    parameter?.type,
                    'Map<string, Integer[]>',
                    '[first method] first parameter type'
                );

                parameter = methods?.get('met1')?.parameters[1];

                assert.equal(
                    parameter?.name,
                    'p2',
                    '[first method] second paramater name'
                );
                assert.equal(
                    parameter?.type,
                    'String',
                    '[first method] second parameter type'
                );
            });

            it('should have a method met2 as in the UML diagram', () => {
                // SECOND METHOD

                assert.equal(
                    methods?.get('met2')?.returnType,
                    'Boolean',
                    '[second method] invalid return type'
                );

                parameter = methods?.get('met2')?.parameters[0];

                assert.equal(
                    parameter?.name,
                    'p1',
                    '[second method] first paramater name'
                );
                assert.equal(
                    parameter?.type,
                    'Map<string, Integer[]>',
                    '[second method] first parameter type'
                );

                parameter = methods?.get('met2')?.parameters[1];

                assert.equal(
                    parameter?.name,
                    'one_very_long_parameter',
                    '[second method] second paramater name'
                );
                assert.equal(
                    parameter?.type,
                    'Integer[]',
                    '[second method] second parameter type'
                );
            });
        });
    });

    describe('Interface', () => {
        it('should have 5 interfaces', () => {
            const umlStructure = umlToDatamodel(UML_DIAGRAMS[4]);

            assert.equal(umlStructure.interfaces.size, 5, 'interface amount');
        });

        describe('#methods', () => {
            it('should have 1 interface with 6 methods', () => {
                const umlStructure = umlToDatamodel(UML_DIAGRAMS[5]);

                assert.equal(
                    umlStructure.interfaces.size,
                    1,
                    'interface amount'
                );

                const interfaceObj = umlStructure.interfaces.get('test01');

                if (interfaceObj) {
                    assert.equal(interfaceObj.methods.size, 6, 'method amount');

                    const method = interfaceObj.methods.get('met6');

                    if (method) {
                        assert.equal(
                            method.returnType,
                            'Map<String, Test>',
                            'met6 returnType'
                        );
                        assert.equal(
                            method.parameters.length,
                            2,
                            'met6 parameter amount'
                        );

                        let parameter = method.parameters[0];

                        if (parameter) {
                            assert.equal(
                                parameter.name,
                                'test',
                                'met6 first parameter name'
                            );
                            assert.equal(
                                parameter.type,
                                'Map<String, Test>',
                                'met6 first parameter name'
                            );

                            parameter = method.parameters[1];

                            if (parameter) {
                                assert.equal(
                                    parameter.name,
                                    'test',
                                    'met6 second parameter name'
                                );
                                assert.equal(
                                    parameter.type,
                                    'Integer',
                                    'met6 second parameter name'
                                );

                                parameter = method.parameters[1];
                            } else {
                                assert.fail(
                                    'met6 second parameter should exists'
                                );
                            }
                        } else {
                            assert.fail('met6 first parameter should exists');
                        }
                    } else {
                        assert.fail('met6 should exists');
                    }
                } else {
                    assert.fail('interface test01 does not exists');
                }
            });
        });
    });

    describe('Enums', () => {
        it('should translate an empty enum', () => {
            const enumStr = 'enum myEnum';

            const umlStructure = umlToDatamodel(enumStr);

            expect(umlStructure.enums.size).toEqual(1);
            const myEnum = umlStructure.enums.get('myEnum');
            expect(myEnum).toBeDefined();
            expect(myEnum?.name).toEqual('myEnum');
            expect(myEnum?.properties.size).toEqual(0);
        });

        it('should translate an enum with 3 property without values', () => {
            const enumStr = 'enum myEnum {\n\tPROP_1\n\tPROP_2\n\tPROP_3\n}';

            const umlStructure = umlToDatamodel(enumStr);

            expect(umlStructure.enums.size).toEqual(1);
            const myEnum = umlStructure.enums.get('myEnum');
            expect(myEnum).toBeDefined();
            expect(myEnum?.name).toEqual('myEnum');

            let parameter = myEnum?.properties.get('PROP_1');
            expect(parameter).toBeDefined();
            expect(parameter?.name).toEqual('PROP_1');
            expect(parameter?.value).toEqual('');

            parameter = myEnum?.properties.get('PROP_2');
            expect(parameter).toBeDefined();
            expect(parameter?.name).toEqual('PROP_2');
            expect(parameter?.value).toEqual('');

            parameter = myEnum?.properties.get('PROP_3');
            expect(parameter).toBeDefined();
            expect(parameter?.name).toEqual('PROP_3');
            expect(parameter?.value).toEqual('');
        });

        it('should translate an enum with 3 property/value couples', () => {
            const enumStr =
                'enum myEnum {\n\tPROP_1 : 0\n\tPROP_2 : 1\n\tPROP_3 : 2\n}';

            const umlStructure = umlToDatamodel(enumStr);

            expect(umlStructure.enums.size).toEqual(1);
            const myEnum = umlStructure.enums.get('myEnum');
            expect(myEnum).toBeDefined();
            expect(myEnum?.name).toEqual('myEnum');

            let parameter = myEnum?.properties.get('PROP_1');
            expect(parameter).toBeDefined();
            expect(parameter?.name).toEqual('PROP_1');
            expect(parameter?.value).toEqual('0');

            parameter = myEnum?.properties.get('PROP_2');
            expect(parameter).toBeDefined();
            expect(parameter?.name).toEqual('PROP_2');
            expect(parameter?.value).toEqual('1');

            parameter = myEnum?.properties.get('PROP_3');
            expect(parameter).toBeDefined();
            expect(parameter?.name).toEqual('PROP_3');
            expect(parameter?.value).toEqual('2');
        });
    });

    describe('Line Modifiers', () => {
        it('should extract a abstract class', () => {
            const umlStructure = umlToDatamodel('{abstract} class c01');

            expect(umlStructure.classes.size).toEqual(1);
            expect(umlStructure.classes.get('c01')).toBeDefined();
            expect(umlStructure.classes.get('c01')?.isAbstract).toBeTruthy();
        });

        it('should extract a static field', () => {
            const umlStructure = umlToDatamodel(
                'class c01 {\n{static}{field}integer someAttribute\n}'
            );

            expect(umlStructure.classes.size).toEqual(1);
            const myClass = umlStructure.classes.get('c01');
            expect(myClass).toBeDefined();
            if (!myClass) throw new Error('myClass should be defined');

            const myAttribute = myClass.attributes.get('someAttribute');
            expect(myAttribute).toBeDefined();
            expect(myAttribute?.isStatic).toBeTruthy();
        });

        it('should extract a static method', () => {
            const umlStructure = umlToDatamodel(
                'class c01 {\n{static}{method}integer someMet()\n}'
            );

            expect(umlStructure.classes.size).toEqual(1);
            const myClass = umlStructure.classes.get('c01');
            expect(myClass).toBeDefined();
            if (!myClass) throw new Error('myClass should be defined');

            const myMethod = myClass.methods.get('someMet');
            expect(myMethod).toBeDefined();
            expect(myMethod?.isStatic).toBeTruthy();
        });

        it('should log a warning for unknown modifier', () => {
            console.log = jest.fn();

            umlToDatamodel('{unknown} class c01');

            expect(console.log).toHaveBeenCalledWith(
                '[Warning] Unknow modifier : unknown'
            );
        });
    });

    describe('Associations', () => {
        it('should extract a composition', () => {
            const umlStructure = umlToDatamodel(
                'class class01\nclass class02\nclass01 "1" o-- "1..*" class02 : Nom assoc'
            );

            expect(umlStructure.classes.size).toEqual(2);
            expect(umlStructure.associations.length).toEqual(1);

            const asso = umlStructure.associations[0];
            expect(asso).toBeDefined();
            expect(asso.leftClass).toEqual('class01');
            expect(asso.rightClass).toEqual('class02');
            expect(asso.leftToRightAssociation).toBe(
                MultiplicityType.OneOrMany
            );
            expect(asso.rightToLeftAssociation).toBe(MultiplicityType.One);
            expect(asso.name).toEqual('Nom assoc');
        });

        it('should extract an association', () => {
            const umlStructure = umlToDatamodel(
                'class class01\nclass class02\nclass01 "*" -- "0..1" class02'
            );

            expect(umlStructure.classes.size).toEqual(2);
            expect(umlStructure.associations.length).toEqual(1);

            const asso = umlStructure.associations[0];
            expect(asso).toBeDefined();
            expect(asso.leftClass).toEqual('class01');
            expect(asso.rightClass).toEqual('class02');
            expect(asso.leftToRightAssociation).toBe(
                MultiplicityType.ZeroOrOne
            );
            expect(asso.rightToLeftAssociation).toBe(MultiplicityType.Many);
            expect(asso.name).toEqual('');
        });

        it('should extract an association without multiplicity', () => {
            const umlStructure = umlToDatamodel(
                'class class01\nclass class02\nclass01 -- class02'
            );

            expect(umlStructure.classes.size).toEqual(2);
            expect(umlStructure.associations.length).toEqual(1);

            const asso = umlStructure.associations[0];
            expect(asso).toBeDefined();
            expect(asso.leftClass).toEqual('class01');
            expect(asso.rightClass).toEqual('class02');
            expect(asso.leftToRightAssociation).toBe(
                MultiplicityType.NotSpecified
            );
            expect(asso.rightToLeftAssociation).toBe(
                MultiplicityType.NotSpecified
            );
            expect(asso.name).toEqual('');
        });
    });
});
