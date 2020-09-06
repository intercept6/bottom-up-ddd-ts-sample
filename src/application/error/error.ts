import { ExtendedError } from '#/util/error';
import { CircleName } from '#/domain/circle/circleName';
import { CircleId } from '#/domain/circle/circleId';

abstract class ApplicationError extends ExtendedError {}

export class UserNotFoundApplicationError extends ApplicationError {}

export class CircleDuplicateApplicationError extends ApplicationError {
  constructor(circleName: CircleName, error?: Error) {
    super(`circle name: ${circleName.getValue()} is already exist`, error);
  }
}

export class ArgumentApplicationError extends ApplicationError {}

export class CircleFullApplicationError extends ApplicationError {
  constructor(circleId: CircleId, error?: Error) {
    super(`circle id: ${circleId.getValue()} is full`, error);
  }
}

export class UnknownApplicationError extends ApplicationError {}
