import { ArgumentDomainError } from '../../errors/domainErrors';

export class MailAddress {
  constructor(private readonly value: string) {
    if (this.value.length < 3) {
      throw new ArgumentDomainError('メールアドレスは3文字以上です');
    }
  }

  getValue() {
    return this.value;
  }

  equals(other: MailAddress) {
    return this.value === other.value;
  }
}
