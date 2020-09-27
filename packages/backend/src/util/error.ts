import { Logger } from './logger';

export abstract class ExtendedError extends Error {
  constructor(message: string, error?: Error) {
    super(message);

    // this.name = this.constructor.name; でも問題ないが、enumerable を false にしたほうがビルトインエラーに近い。
    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true,
    });

    // エラーがスローされた場所の適切なスタックトレースを維持する（V8エンジニアでのみ使用可能な為、if文でケアする）
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else if (error != null) {
      const messageLines = (this.message.match(/\n/g) || []).length + 1;
      if (this.stack) {
        this.stack =
          this.stack
            .split('\n')
            .slice(0, messageLines + 1)
            .join('\n') +
          '\n' +
          error.stack;
      }
    }
  }
}

export class UnknownError extends ExtendedError {
  constructor(message: string, error?: Error) {
    Logger.error(error);
    super(message, error);
  }
}
