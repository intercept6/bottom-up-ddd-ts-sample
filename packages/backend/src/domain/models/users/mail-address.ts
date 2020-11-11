import { ArgumentDomainError } from '../../errors/domain-errors';

export class MailAddress {
  constructor(private readonly value: string) {
    if (this.value.length < 3) {
      throw new ArgumentDomainError('メールアドレスは3文字以上です');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: MailAddress): boolean {
    return this.value === other.value;
  }
}
