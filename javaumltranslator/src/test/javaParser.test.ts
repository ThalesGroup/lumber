import { parse } from 'java-parser';
import { Parameter } from '../datamodel';
import { JavaToDatamodelVisitor } from '../utils/JavaToDatamodelVisitor';

describe('Parser', () => {
    describe('Class', () => {
        it('should translate a class with 3 attributes and 4 methods', () => {
            const javaStr = `public class MusicDisk implements Searchable {
    private String albumTitle;
    private String singer;
    private String musicType;

    public String getAlbumTitle() {return null;}
    public String getSinger() {return null;}
    public String getMusicType() {return null;}
    public Boolean match() {return null;}
}`;

            const myVisitor = new JavaToDatamodelVisitor();

            const cst = parse(javaStr);
            myVisitor.visit(cst);

            const { datamodel } = myVisitor;

            expect(datamodel.classes.size).toBe(1);

            const myClass = datamodel.classes.get('MusicDisk');

            expect(myClass).toBeDefined();

            if (!myClass) throw new Error('myClass undefined');

            // Attributes
            expect(myClass.attributes.size).toBe(3);

            expect(myClass.methods.size).toBe(4);
        });
    });

    describe('Interface', () => {
        it('should translate an interface with 5 methods', () => {
            const javaStr = `public interface Library {
    public void addBook(Book b);
    public void removeBook(Book b);
    public void addDisk(MusicDisk mD);
    public Book searchBook(String title, String author);
    public MusicDisk searchDisk(String album);
}`;

            const myVisitor = new JavaToDatamodelVisitor();

            const cst = parse(javaStr);
            myVisitor.visit(cst);

            const { datamodel } = myVisitor;

            expect(datamodel.interfaces.size).toBe(1);

            const myInterface = datamodel.interfaces.get('Library');

            expect(myInterface).toBeDefined();

            if (!myInterface) throw new Error('myInterface undefined');

            expect(myInterface.methods.size).toBe(5);
            expect(myInterface.methods.get('addBook')).toBeDefined();
            expect(myInterface.methods.get('addBook')?.returnType).toBe('void');
            expect(myInterface.methods.get('addBook')?.parameters).toEqual([
                new Parameter('b', 'Book')
            ]);

            expect(myInterface.methods.get('removeBook')).toBeDefined();
            expect(myInterface.methods.get('removeBook')?.returnType).toBe(
                'void'
            );
            expect(myInterface.methods.get('removeBook')?.parameters).toEqual([
                new Parameter('b', 'Book')
            ]);

            expect(myInterface.methods.get('addDisk')).toBeDefined();
            expect(myInterface.methods.get('addDisk')?.returnType).toBe('void');
            expect(myInterface.methods.get('addDisk')?.parameters).toEqual([
                new Parameter('mD', 'MusicDisk')
            ]);

            expect(myInterface.methods.get('searchBook')).toBeDefined();
            expect(myInterface.methods.get('searchBook')?.returnType).toBe(
                'Book'
            );
            expect(myInterface.methods.get('searchBook')?.parameters).toEqual([
                new Parameter('title', 'String'),
                new Parameter('author', 'String')
            ]);

            expect(myInterface.methods.get('searchDisk')).toBeDefined();
            expect(myInterface.methods.get('searchDisk')?.returnType).toBe(
                'MusicDisk'
            );
            expect(myInterface.methods.get('searchDisk')?.parameters).toEqual([
                new Parameter('album', 'String')
            ]);
        });
    });
});
