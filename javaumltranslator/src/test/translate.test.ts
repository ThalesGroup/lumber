import * as assert from 'assert';
import { Attribute } from '../datamodel/Attribute';
import { Class } from '../datamodel/Class';
import { Interface } from '../datamodel/Interface';
import { Method } from '../datamodel/Method';
import { Parameter } from '../datamodel/Parameter';
import { VisibleType } from '../datamodel/UMLType';
import { JavaTranslator } from '../JavaTranslator';

const TRANSLATOR = new JavaTranslator();

describe('Templates', () => {
    describe('Class', () => {
        it('should translate a class with 3 attributes', () => {
            const classModel = new Class('TestClassAttribute');
            classModel.addAttribute(new Attribute('attr1', 'String'));
            classModel.addAttribute(
                new Attribute(
                    'attr2',
                    'Map<String, Boolean>',
                    VisibleType.Public,
                    true
                )
            );
            classModel.addAttribute(new Attribute('attr3', 'Number'));

            assert.equal(
                TRANSLATOR.translateClass(classModel),
                `public class TestClassAttribute {
\tprivate String attr1;
\tpublic static Map<String, Boolean> attr2;
\tprivate Number attr3;
}`
            );
        });

        it('should translate a class with 3 methods', () => {
            const classModel = new Class('TestClassMethod');
            classModel.addMethod(
                new Method('met1', 'String', undefined, VisibleType.Private)
            );
            classModel.addMethod(
                new Method(
                    'met2',
                    'Map<String, Boolean>',
                    [
                        new Parameter('p1', 'String'),
                        new Parameter('p2', 'Map<test, Boolean>')
                    ],
                    VisibleType.Public,
                    true
                )
            );
            classModel.addMethod(
                new Method(
                    'met3',
                    'Number',
                    undefined,
                    VisibleType.Private,
                    true
                )
            );

            assert.equal(
                TRANSLATOR.translateClass(classModel),
                `public class TestClassMethod {
\tprivate String met1() {return null;}
\tpublic abstract Map<String, Boolean> met2(String p1, Map<test, Boolean> p2);
\tprivate abstract Number met3();
}`
            );
        });

        it('should translate a class with 3 attributes and 3 methods', () => {
            const classModel = new Class('TestClassMethod');
            classModel.addAttribute(new Attribute('attr1', 'String'));
            classModel.addAttribute(
                new Attribute(
                    'attr2',
                    'Map<String, Boolean>',
                    VisibleType.Public,
                    true
                )
            );
            classModel.addAttribute(new Attribute('attr3', 'Number'));
            classModel.addMethod(
                new Method('met1', 'String', undefined, VisibleType.Private)
            );
            classModel.addMethod(
                new Method(
                    'met2',
                    'Map<String, Boolean>',
                    [
                        new Parameter('p1', 'String'),
                        new Parameter('p2', 'Map<test, Boolean>')
                    ],
                    VisibleType.Public,
                    true
                )
            );
            classModel.addMethod(
                new Method(
                    'met3',
                    'Number',
                    undefined,
                    VisibleType.Private,
                    true
                )
            );

            assert.equal(
                TRANSLATOR.translateClass(classModel),
                `public class TestClassMethod {
\tprivate String attr1;
\tpublic static Map<String, Boolean> attr2;
\tprivate Number attr3;

\tprivate String met1() {return null;}
\tpublic abstract Map<String, Boolean> met2(String p1, Map<test, Boolean> p2);
\tprivate abstract Number met3();
}`
            );
        });

        it('should translate a class with an extend', () => {
            const classModel = new Class('Class1', 'ClassTest');
            classModel.addAttribute(new Attribute('attr1', 'String'));
            classModel.addMethod(
                new Method('met1', 'String', undefined, VisibleType.Private)
            );

            assert.equal(
                TRANSLATOR.translateClass(classModel),
                `public class Class1 extends ClassTest {
\tprivate String attr1;

\tprivate String met1() {return null;}
}`
            );
        });

        it('should translate a class with an implement', () => {
            const classModel = new Class('Class1', undefined, [
                'TestInterface',
                'TestInt2'
            ]);
            classModel.addAttribute(new Attribute('attr1', 'String'));
            classModel.addMethod(
                new Method('met1', 'String', undefined, VisibleType.Private)
            );

            assert.equal(
                TRANSLATOR.translateClass(classModel),
                `public class Class1 implements TestInterface, TestInt2 {
\tprivate String attr1;

\tprivate String met1() {return null;}
}`
            );
        });

        it('should translate 3 classes', () => {
            const classes: Map<string, Class> = new Map();

            let classModel = new Class('Class1', 'TestClass', [
                'TestInter',
                'Interface2'
            ]);
            classModel.addAttribute(new Attribute('attr1', 'String'));
            classModel.addMethod(
                new Method('met1', 'String', undefined, VisibleType.Private)
            );
            classes.set(classModel.name, classModel);

            classModel = new Class('Class2');
            classModel.addAttribute(
                new Attribute(
                    'attr2',
                    'Map<String, Boolean>',
                    VisibleType.Public,
                    true
                )
            );
            classModel.addMethod(
                new Method(
                    'met2',
                    'Map<String, Boolean>',
                    [
                        new Parameter('p1', 'String'),
                        new Parameter('p2', 'Map<test, Boolean>')
                    ],
                    VisibleType.Public,
                    true
                )
            );
            classes.set(classModel.name, classModel);

            classModel = new Class('Class3');
            classModel.addAttribute(new Attribute('attr3', 'Number'));
            classModel.addMethod(
                new Method(
                    'met3',
                    'Number',
                    undefined,
                    VisibleType.Private,
                    true
                )
            );
            classes.set(classModel.name, classModel);

            assert.equal(
                TRANSLATOR.translateClasses(classes),
                `public class Class1 extends TestClass implements TestInter, Interface2 {
\tprivate String attr1;

\tprivate String met1() {return null;}
}

public class Class2 {
\tpublic static Map<String, Boolean> attr2;

\tpublic abstract Map<String, Boolean> met2(String p1, Map<test, Boolean> p2);
}

public class Class3 {
\tprivate Number attr3;

\tprivate abstract Number met3();
}`
            );
        });
    });

    describe('Interface', () => {
        it('should translate an interface with 3 methods', () => {
            const interfaceModel = new Interface('TestInterfaceMethod');
            interfaceModel.addMethod(
                new Method('met1', 'String', undefined, VisibleType.Private)
            );
            interfaceModel.addMethod(
                new Method(
                    'met2',
                    'Map<String, Boolean>',
                    [
                        new Parameter('p1', 'String'),
                        new Parameter('p2', 'Map<test, Boolean>')
                    ],
                    VisibleType.Public,
                    true
                )
            );
            interfaceModel.addMethod(new Method('met3', 'Number'));

            assert.equal(
                TRANSLATOR.translateInterface(interfaceModel),
                `public interface TestInterfaceMethod {
\tprivate String met1();
\tpublic Map<String, Boolean> met2(String p1, Map<test, Boolean> p2);
\tpublic Number met3();
}`
            );
        });

        it('should translate 3 interfaces', () => {
            const interfaces: Map<string, Interface> = new Map();
            let interfaceModel = new Interface('Inter1');
            interfaceModel.addMethod(
                new Method('met1', 'String', undefined, VisibleType.Private)
            );
            interfaces.set(interfaceModel.name, interfaceModel);

            interfaceModel = new Interface('Inter2');
            interfaceModel.addMethod(
                new Method(
                    'met2',
                    'Map<String, Boolean>',
                    [
                        new Parameter('p1', 'String'),
                        new Parameter('p2', 'Map<test, Boolean>')
                    ],
                    VisibleType.Public,
                    true
                )
            );
            interfaces.set(interfaceModel.name, interfaceModel);

            interfaceModel = new Interface('Inter3');
            interfaceModel.addMethod(new Method('met3', 'Number'));
            interfaces.set(interfaceModel.name, interfaceModel);

            assert.equal(
                TRANSLATOR.translateInterfaces(interfaces),
                `public interface Inter1 {
\tprivate String met1();
}

public interface Inter2 {
\tpublic Map<String, Boolean> met2(String p1, Map<test, Boolean> p2);
}

public interface Inter3 {
\tpublic Number met3();
}`
            );
        });
    });
});
