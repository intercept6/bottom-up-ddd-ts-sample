import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { isUserArray } from '#/util/typeGuard';

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

export class UserNotFoundException extends ExtendedError {
  constructor(userId: UserId, error?: Error);
  constructor(userName: UserName, error?: Error);
  constructor(mailAddress: MailAddress, error?: Error);
  constructor(userIds: UserId[], error?: Error);
  constructor(
    identifier: UserId | UserName | MailAddress | UserId[],
    error?: Error
  ) {
    if (identifier instanceof UserId) {
      super(`user id: ${identifier.getValue()} is not found`, error);
    } else if (identifier instanceof UserName) {
      super(`user name: ${identifier.getValue()} is not found`, error);
    } else if (identifier instanceof MailAddress) {
      super(`user mailAddress: ${identifier.getValue()} is not found`, error);
    } else if (isUserArray(identifier)) {
      super(
        `user ids: ${identifier.map((value) => value.getValue())} is not found`,
        error
      );
    } else {
      throw new ArgumentException(
        `The method was called with unintended arguments`
      );
    }
  }
}

export class UserDuplicateException extends ExtendedError {
  constructor(userId: UserId, error?: Error);
  constructor(userName: UserName, error?: Error);
  constructor(mailAddress: MailAddress, error?: Error);
  constructor(identity: UserId | UserName | MailAddress, error?: Error) {
    if (identity instanceof UserId) {
      super(`user id: ${identity.getValue()} is already exist`, error);
    } else if (identity instanceof UserName) {
      super(`user name: ${identity.getValue()} is already exist`, error);
    } else {
      super(`user mailAddress: ${identity.getValue()} is already exist`, error);
    }
  }
}

type PrimitiveTypes =
  | 'undefined'
  | 'object'
  | 'boolean'
  | 'number'
  | 'bigint'
  | 'string'
  | 'symbol'
  | 'function';

export class TypeException extends ExtendedError {
  constructor(
    variableName: string,
    expected: PrimitiveTypes,
    got: PrimitiveTypes
  ) {
    super(
      `[TypeException] ${variableName} should be ${expected} type, but it is ${got} type`
    );
  }
}

export class ArgumentException extends ExtendedError {
  constructor(message: string, error?: Error) {
    super(`[ArgumentException] ${message}`, error);
  }
}

export class BadParameterException extends ExtendedError {
  constructor(message: string, error?: Error) {
    super(`[BadParameterException] ${message}`, error);
  }
}

export class UnknownException extends ExtendedError {
  constructor(error: Error) {
    super('[UnknownException]', error);
  }
}
