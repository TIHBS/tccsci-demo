import {MemberSignature} from './member-signature';
import {Parameter} from './parameter';
import {Argument} from './argument';

export class InvokeRequest {
  callbackUrl: string | undefined;
  correlationId: string | undefined;
  readonly callbackBinding: string = "json-rpc"
  sideEffects: boolean | undefined;
  degreeOfConfidence: number | undefined;
  timeout: number | undefined;
  nonce: number | undefined;
  digitalSignature: string | undefined;
  signature: MemberSignature | undefined;
  outputParams: Parameter[] | undefined;
  inputArguments: Argument[] | undefined;
}
