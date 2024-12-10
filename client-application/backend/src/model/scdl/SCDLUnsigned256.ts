import {SCDLType} from './SCDLType';

export class SCDLUnsigned256 implements SCDLType {
  readonly type: string = "integer";
  readonly minimum: string = "0";
  readonly maximum: string = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
}
