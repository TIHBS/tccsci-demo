import {SCDLEthereumAddress} from '../scdl/SCDLEthereumAddress';
import {SCDLType} from '../scdl/SCDLType';

export class Parameter {
  name: string | undefined;
  type: string | undefined;

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
  }
}
