export class UserId {
  constructor(private readonly value: string) {}

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
