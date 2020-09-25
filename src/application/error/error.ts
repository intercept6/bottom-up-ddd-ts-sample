import { ExtendedError } from '#/util/error';
import { CircleName } from '#/domain/models/circle/circleName';
import { CircleId } from '#/domain/models/circle/circleId';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { isUserArray } from '#/util/typeGuard';

abstract class ApplicationError extends ExtendedError {}

export class ArgumentApplicationError extends ApplicationError {}

export class UserNotFoundApplicationError extends ApplicationError {
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
      throw new ArgumentApplicationError(
        `The method was called with unintended arguments`
      );
    }
  }
}
export class UserDuplicateApplicationError extends ApplicationError {
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

export class CircleDuplicateApplicationError extends ApplicationError {
  constructor(circleName: CircleName, error?: Error) {
    super(`circle name: ${circleName.getValue()} is already exist`, error);
  }
}

export class CircleMembersAreExceedApplicationError extends ApplicationError {
  constructor(circleId: CircleId, error?: Error) {
    super(`circle id: ${circleId.getValue()} is full`, error);
  }
}
