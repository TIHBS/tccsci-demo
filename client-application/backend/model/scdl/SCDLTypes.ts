import {SCDLString} from './SCDLString';
import {SCDLBoolean} from './SCDLBoolean';
import {SCDLEthereumAddress} from './SCDLEthereumAddress';
import {SCDLUnsigned256} from './SCDLUnsigned256';

export class SCDLTypes {
  public static readonly STRING: string = JSON.stringify(new SCDLString());
  public static readonly BOOLEAN: string = JSON.stringify(new SCDLBoolean());
  public static readonly ETHEREUM_ADDRESS: string = JSON.stringify(new SCDLEthereumAddress());
  public static readonly UNSIGNED_256: string = JSON.stringify(new SCDLUnsigned256());
}
