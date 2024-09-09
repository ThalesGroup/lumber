import { ProtobufTranslator } from '../ProtobufTranslator';
import {
    Association,
    Attribute,
    Class,
    Enum,
    EnumProperty,
    Interface,
    Method,
    MultiplicityType,
    Parameter,
    UMLStructure
} from '../datamodel';

const dataModel = new UMLStructure();
const class1 = new Class('Class1', 'ExtendClass');
class1.addAttribute(new Attribute('attr1', 'Map'));
class1.addAttribute(new Attribute('attr2', 'int'));
const class2 = new Class('Class2');

const class1Translated =
    'message Class1 {\n\tMap attr1 = 1;\n\tint32 attr2 = 2;\n}';
const class2Translated = 'message Class2 {\n}';

const services = new Interface('Interface1Services');
services.addMethod(
    new Method('met1', 'Map', [new Parameter('param1', 'string')])
);
services.addMethod(new Method('met2', 'void'));
const events = new Interface('Interface2Events');
events.addMethod(
    new Method('onMet1', undefined, [new Parameter('param1', 'Map')])
);
events.addMethod(
    new Method('onMet2', 'void', [
        new Parameter('param1', 'int'),
        new Parameter('param2', 'bool')
    ])
);
const dataEvents = new Interface('Interface3DataProvider');
dataEvents.addMethod(
    new Method('onMet1', 'void', [new Parameter('param1', 'string')])
);
dataEvents.addMethod(new Method('onMet2', 'void'));

const servicesTranslated =
    'service Interface1Services {\n\trpc met1(met1Request) returns (Map) {}\n\trpc met2(google.protobuf.Empty) returns (google.protobuf.Empty) {}\n}';
const eventsTranslated =
    'service Interface2Events {\n\trpc getMet1Event(google.protobuf.Empty) returns (stream Map) {}\n\trpc getMet2Event(google.protobuf.Empty) returns (stream Met2Event) {}\n}';
const dataEventsTranslated =
    'service Interface3DataProvider {\n\trpc suscribeMet1Event(google.protobuf.Empty) returns (string) {}\n\trpc suscribeMet2Event(google.protobuf.Empty) returns (google.protobuf.Empty) {}\n}';

const enum1 = new Enum('enum1');
enum1.addProperty(new EnumProperty('PROP_1', '0'));
enum1.addProperty(new EnumProperty('PROP_2', '1'));
enum1.addProperty(new EnumProperty('PROP_3', '2'));
const enum2 = new Enum('enum2');
enum2.addProperty(new EnumProperty('PROP_1', '0'));
enum2.addProperty(new EnumProperty('PROP_2', '1'));
enum2.addProperty(new EnumProperty('PROP_3', '2'));

const enum1Translated =
    'enum enum1 {\n\tPROP_1 = 0;\n\tPROP_2 = 1;\n\tPROP_3 = 2;\n}';
const enum2Translated =
    'enum enum2 {\n\tPROP_1 = 0;\n\tPROP_2 = 1;\n\tPROP_3 = 2;\n}';

dataModel.addClass(class1);
dataModel.addClass(class2);

dataModel.addInterface(services);
dataModel.addInterface(events);
dataModel.addInterface(dataEvents);

dataModel.addEnum(enum1);
dataModel.addEnum(enum2);

const translator = new ProtobufTranslator();

describe('Templates', () => {
    describe('Class', () => {
        it('should translate an empty class', () => {
            const result = translator.translateClass(class2);

            expect(result).toEqual(class2Translated);
        });

        it('should translate a class', () => {
            const result = translator.translateClass(class1);

            expect(result).toEqual(class1Translated);
        });

        it('should translate some classes', () => {
            const result = translator.translateClasses(dataModel.classes);

            expect(result).toEqual(
                class1Translated + '\n\n' + class2Translated
            );
        });
    });

    describe('Interface', () => {
        it('should translate an empty interface', () => {
            const result = translator.translateInterface(
                new Interface('myInterface')
            );

            expect(result).toEqual('service myInterface {\n}');
        });

        it('should translate a services interface', () => {
            console.warn = jest.fn();

            const result = translator.translateInterface(services);

            expect(result).toEqual(servicesTranslated);
            expect(console.warn).toBeCalledTimes(2);
        });

        it('should translate an events interface', () => {
            const result = translator.translateInterface(events);

            expect(result).toEqual(eventsTranslated);
        });

        it('should translate a dataEvents interface', () => {
            const result = translator.translateInterface(dataEvents);

            expect(result).toEqual(dataEventsTranslated);
        });

        it('should translate some interfaces', () => {
            const result = translator.translateInterfaces(dataModel.interfaces);

            expect(result).toEqual(
                servicesTranslated +
                    '\n\n' +
                    eventsTranslated +
                    '\n\n' +
                    dataEventsTranslated
            );
        });
    });

    describe('Enum', () => {
        it('should translate an empty enum', () => {
            const result = translator.translateEnum(new Enum('myEnum'));

            expect(result).toEqual('enum myEnum {\n}');
        });

        it('should translate an enum', () => {
            const result = translator.translateEnum(enum1);

            expect(result).toEqual(enum1Translated);
        });

        it('should translate some enums', () => {
            const result = translator.translateEnums(dataModel.enums);

            expect(result).toEqual(enum1Translated + '\n\n' + enum2Translated);
        });
    });

    describe('Association', () => {
        it('should resolve a left to right aggregation between two classes', () => {
            const class1 = new Class('MyClass1');
            const class2 = new Class('MyClass2');
            const association = new Association(
                class1.name,
                class2.name,
                '*-->',
                MultiplicityType.NotSpecified,
                MultiplicityType.NotSpecified,
                'myClass2'
            );
            const dataModel = new UMLStructure();
            dataModel.addClass(class1);
            dataModel.addClass(class2);
            dataModel.addAssociation(association);

            translator.processAssociations(dataModel);

            expect(dataModel.classes.size).toEqual(2);
            expect(class1.attributes.size).toEqual(1);
            expect(class2.attributes.size).toEqual(0);

            const attribute = class1.attributes.get('myClass2');
            expect(attribute).toBeDefined();
            expect(attribute?.name).toEqual('myClass2');
            expect(attribute?.type).toEqual('MyClass2');
        });

        it('should resolve a right to left aggregation between two classes', () => {
            const class1 = new Class('MyClass1');
            const class2 = new Class('MyClass2');
            const association = new Association(
                class2.name,
                class1.name,
                '<--*',
                MultiplicityType.NotSpecified,
                MultiplicityType.NotSpecified,
                'myClass2'
            );
            const dataModel = new UMLStructure();
            dataModel.addClass(class1);
            dataModel.addClass(class2);
            dataModel.addAssociation(association);

            translator.processAssociations(dataModel);

            expect(dataModel.classes.size).toEqual(2);
            expect(class1.attributes.size).toEqual(1);
            expect(class2.attributes.size).toEqual(0);

            const attribute = class1.attributes.get('myClass2');
            expect(attribute).toBeDefined();
            expect(attribute?.name).toEqual('myClass2');
            expect(attribute?.type).toEqual('MyClass2');
        });

        it('should resolve a left to right association between two classes', () => {
            const class1 = new Class('MyClass1');
            const class2 = new Class('MyClass2');
            const association = new Association(
                class1.name,
                class2.name,
                '--',
                MultiplicityType.NotSpecified,
                MultiplicityType.NotSpecified,
                'myClass2'
            );
            const dataModel = new UMLStructure();
            dataModel.addClass(class1);
            dataModel.addClass(class2);
            dataModel.addAssociation(association);

            translator.processAssociations(dataModel);

            expect(dataModel.classes.size).toEqual(2);
            expect(class1.attributes.size).toEqual(1);
            expect(class2.attributes.size).toEqual(0);

            const attribute = class1.attributes.get('myClass2');
            expect(attribute).toBeDefined();
            expect(attribute?.name).toEqual('myClass2');
            expect(attribute?.type).toEqual('MyClass2');
        });
    });

    describe('Translate All', () => {
        const resultStart =
            'syntax = "proto3";\n\nimport "google/protobuf/empty.proto";\n\noption java_multiple_files = true;\noption java_generic_services = false;\noption java_package = "{{packageName}}";\n\n';
        it('should translate some classes', () => {
            const myDataModel = new UMLStructure(dataModel.classes);

            const resultStr = translator.translateAll(myDataModel);

            expect(resultStr).toEqual(
                resultStart +
                    class1Translated +
                    '\n\n' +
                    class2Translated +
                    '\n\n// UNREFERENCED MESSAGE TYPES FROM PARSED UML\n\n\n' +
                    'message Map {\n}'
            );
        });
        it('should translate some interfaces', () => {
            const myDataModel = new UMLStructure(
                undefined,
                dataModel.interfaces
            );

            const resultStr = translator.translateAll(myDataModel);

            expect(resultStr).toEqual(
                resultStart +
                    servicesTranslated +
                    '\n\n' +
                    eventsTranslated +
                    '\n\n' +
                    dataEventsTranslated +
                    '\n\n// UNREFERENCED MESSAGE TYPES FROM PARSED UML\n\n\n' +
                    'message Map {\n}\n\nmessage met1Request {\n}\n\nmessage Met2Event {\n}'
            );
        });

        it('should translate some enums', () => {
            const myDataModel = new UMLStructure(
                undefined,
                undefined,
                dataModel.enums
            );

            const resultStr = translator.translateAll(myDataModel);

            expect(resultStr).toEqual(
                resultStart + enum1Translated + '\n\n' + enum2Translated
            );
        });

        it('should translate a complete datamodel', () => {
            const resultStr = translator.translateAll(dataModel);

            expect(resultStr).toEqual(
                resultStart +
                    servicesTranslated +
                    '\n\n' +
                    eventsTranslated +
                    '\n\n' +
                    dataEventsTranslated +
                    '\n\n' +
                    class1Translated +
                    '\n\n' +
                    class2Translated +
                    '\n\n' +
                    enum1Translated +
                    '\n\n' +
                    enum2Translated +
                    '\n\n// UNREFERENCED MESSAGE TYPES FROM PARSED UML\n\n\n' +
                    'message Map {\n}\n\nmessage met1Request {\n}\n\nmessage Met2Event {\n}'
            );
        });
    });
});
