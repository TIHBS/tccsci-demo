export class SCDLEthereumAddress  {
  readonly type: string = "string";
  readonly pattern: string = "^0x[a-fA-F0-9]{40}$";
}
