import { ArgumentException } from '#/util/error';

export class UserName {
  constructor(private readonly value: string) {
    if (this.value.length < 3) {
      throw new ArgumentException('ユーザ名は3文字以上です');
    }
    if (this.value.length > 20) {
      throw new ArgumentException('ユーザ名は20文字以下です');
    }
    const match = this.value.match(/^[a-zA-Z]+$/g);
    if (match != null) {
      throw new ArgumentException(
        `許可されていない文字 ${match} が使われています。`
      );
    }
  }

  getValue() {
    return this.value;
  }

  equals(other: UserName) {
    return this.value === other.value;
  }
}
