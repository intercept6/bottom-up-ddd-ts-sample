import { ExtendedError } from '#/util/error';
import { CircleName } from '#/domain/models/circle/circleName';
import { CircleId } from '#/domain/models/circle/circleId';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';

abstract class ApplicationError extends ExtendedError {}

export class ArgumentApplicationError extends ApplicationError {}

export class UserNotFoundApplicationError extends ApplicationError {
  constructor(identifier: UserId | UserName | MailAddress, error?: Error) {
    if (identifier instanceof UserId) {
      super(`user id: ${identifier.getValue()} is not found`, error);
    } else if (identifier instanceof UserName) {
      super(`user name: ${identifier.getValue()} is not found`, error);
    } else {
      super(`user mailAddress: ${identifier.getValue()} is not found`, error);
    }
  }
}

export class OwnerNotFoundApplicationError extends ApplicationError {
  constructor(ownerId: UserId, error?: Error) {
    super(`owner id: ${ownerId.getValue()} is not found`, error);
  }
}

export class MembersNotFoundApplicationError extends ApplicationError {
  constructor(memberIds: UserId[], error?: Error) {
    super(
      `member ids: ${memberIds.map((value) => value.getValue())} is not found`,
      error
    );
  }
}

export class CircleNotFoundApplicationError extends ApplicationError {
  constructor(identifier: CircleId | CircleName, error?: Error) {
    if (identifier instanceof CircleId) {
      super(`circle id: ${identifier.getValue()} is not found`, error);
    } else {
      super(`circle name: ${identifier.getValue()} is not found`, error);
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
