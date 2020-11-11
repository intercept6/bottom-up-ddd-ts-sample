export class CircleId {
  constructor(private readonly value: string) {}

  getValue() {
    return this.value;
  }

  equals(other: CircleId) {
    return this.value === other.getValue();
  }
}
