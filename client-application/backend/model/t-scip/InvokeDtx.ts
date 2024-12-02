import {Parameter} from "../scip/parameter";
import {Argument} from "../scip/argument";

export class InvokeDtx {
    scl: string | undefined;
    methodName: string | undefined;
    inputParameters: Parameter[] | undefined;
    outputParameters: Parameter[] | undefined;
    inputArguments: Argument[];
    hasReturnValues: boolean;

}