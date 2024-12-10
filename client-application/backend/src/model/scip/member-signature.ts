import {Parameter} from './parameter';

export class MemberSignature {
  name: string | undefined;
  function: boolean | undefined;
  parameters: Parameter[] | undefined;

  constructor(name: string, isFunction: boolean, parameters: Parameter[]) {
    this.name = name;
    this.function = isFunction;
    this.parameters = parameters;
  }
}
