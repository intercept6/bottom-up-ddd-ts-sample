export class CircleId {
  constructor(private readonly value: string) {}

  getValue(): string {
    return this.value;
  }

  equals(other: CircleId): boolean {
    return this.value === other.getValue();
  }
}
