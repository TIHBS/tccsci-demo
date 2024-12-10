import {Argument} from './argument';

export class InvokeResponse {
  correlationId: string | undefined;
  timestamp: string | undefined;
  outputArguments: Argument[] | undefined;
}
