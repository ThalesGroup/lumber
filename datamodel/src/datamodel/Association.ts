export class Association {
    public leftClass: string;
    public rightClass: string;
    public separator: string;
    public leftToRightAssociation: MultiplicityType;
    public rightToLeftAssociation: MultiplicityType;
    public name: string;

    constructor(
        leftClass: string,
        rightClass: string,
        separator = '--',
        leftToRightAssociation: MultiplicityType = MultiplicityType.NotSpecified,
        rightToLeftAssociation: MultiplicityType = MultiplicityType.NotSpecified,
        name = ''
    ) {
        this.leftClass = leftClass;
        this.rightClass = rightClass;
        this.separator = separator;
        this.leftToRightAssociation = leftToRightAssociation;
        this.rightToLeftAssociation = rightToLeftAssociation;
        this.name = name;
    }
}

export enum MultiplicityType {
    ZeroOrOne = '0..1',
    One = '1',
    OneOrMany = '1..*',
    Many = '*',
    NotSpecified = ''
}
