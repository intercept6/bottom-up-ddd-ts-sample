export class UserName {
  constructor(private readonly value: string) {
    if (this.value.length < 3) {
      throw new Error('ユーザ名は3文字以上です');
    }
    if (this.value.length > 20) {
      throw new Error('ユーザ名は20文字以下です');
    }
  }

  getValue() {
    return this.value;
  }

  equals(other: UserName) {
    return this.value === other.value;
  }
}
