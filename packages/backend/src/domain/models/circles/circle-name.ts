import { ArgumentDomainError } from '../../errors/domain-errors';

export class CircleName {
  constructor(private readonly value: string) {
    if (value.length < 3) {
      throw new ArgumentDomainError(
        'Circle name must be at least 3 characters'
      );
    } else if (value.length > 20) {
      throw new ArgumentDomainError(
        'Circle name must be 20 characters or less'
      );
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CircleName): boolean {
    return this.value === other.value;
  }
}
