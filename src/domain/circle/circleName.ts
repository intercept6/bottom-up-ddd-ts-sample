import { ArgumentException } from '#/domain/error/error';

export class CircleName {
  constructor(private readonly value: string) {
    if (value.length < 3) {
      throw new ArgumentException('Circle name must be at least 3 characters');
    } else if (value.length > 20) {
      throw new ArgumentException('Circle name must be 20 characters or less');
    }
  }

  getValue() {
    return this.value;
  }

  equals(other: CircleName) {
    return this.value === other.value;
  }
}
