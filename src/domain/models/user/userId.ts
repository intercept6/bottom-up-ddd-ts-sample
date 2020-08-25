export class UserId {
  constructor(private readonly value: string) {}

  getValue() {
    return this.value;
  }

  equals(other: UserId) {
    return this.value === other.value;
  }
}
