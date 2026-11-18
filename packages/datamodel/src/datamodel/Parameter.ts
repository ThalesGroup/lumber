export class Parameter {
    public name: string;
    public type: string;

    constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
    }

    public toString(): string {
        return `${this.type} ${this.name}`;
    }
}
