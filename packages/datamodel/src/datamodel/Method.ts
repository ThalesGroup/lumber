import { VisibleType, UMLType } from './UMLType';
import { Parameter } from './Parameter';

export class Method {
    public name: string;
    public parameters: Parameter[];
    public visibility: VisibleType;
    public returnType: string;
    public isAbstract: boolean;
    public isStatic: boolean;

    constructor(
        name: string,
        returnType = 'void',
        parameters: Parameter[] = [],
        visibility: VisibleType = VisibleType.Public,
        isAbstract = false,
        isStatic = false
    ) {
        this.name = name;
        this.parameters = parameters;
        this.visibility = visibility;
        this.returnType = returnType;
        this.isAbstract = isAbstract;
        this.isStatic = isStatic;
    }

    public addParameter(parameter: Parameter): void {
        this.parameters.push(parameter);
    }

    public addParameters(parameters: Parameter[]): void {
        this.parameters.push(...parameters);
    }

    public buildParametersFrom(str: string) {
        str += ','; // To make the regex works

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let itResult: IteratorResult<RegExpMatchArray, any>;
        const it = str.matchAll(UMLType.PARAMETERS);

        while ((itResult = it.next()).done == false) {
            const param = itResult.value;
            if (param[1] && param[2]) {
                this.addParameter(new Parameter(param[2], param[1]));
            } else if (param[3] && param[4]) {
                this.addParameter(new Parameter(param[3], param[4]));
            }
        }
    }
}
