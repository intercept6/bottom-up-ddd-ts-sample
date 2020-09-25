import { ExtendedError } from '#/util/error';
import { CircleName } from '#/domain/models/circle/circleName';
import { CircleId } from '#/domain/models/circle/circleId';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { isUserArray } from '#/util/typeGuard';

type PrimitiveTypes =
  | 'undefined'
  | 'object'
  | 'boolean'
  | 'number'
  | 'bigint'
  | 'string'
  | 'string[]'
  | 'symbol'
  | 'function'
  | 'unknown';

export class RepositoryError extends ExtendedError {}

export class UserNotFoundRepositoryError extends RepositoryError {
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
      throw new ArgumentRepositoryError(
        `The method was called with unintended arguments`
      );
    }
  }
}

export class CircleNotFoundRepositoryError extends RepositoryError {
  constructor(identifier: CircleId | CircleName, error?: Error) {
    if (identifier instanceof CircleId) {
      super(`circle id: ${identifier.getValue()} is not found`, error);
    } else {
      super(`circle name: ${identifier.getValue()} is not found`, error);
    }
  }
}

export class ArgumentRepositoryError extends RepositoryError {}

export class TypeRepositoryError extends RepositoryError {
  constructor({
    variableName,
    expected,
    got,
  }: {
    variableName: string;
    expected: PrimitiveTypes;
    got: PrimitiveTypes;
  }) {
    super(`${variableName} should be ${expected} type, but it is ${got} type`);
  }
}
