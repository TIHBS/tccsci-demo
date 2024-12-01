export class Argument {
  name: string | undefined;
  value: string | undefined;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}
