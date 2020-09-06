import { ExtendedError } from '#/util/error';
import { CircleName } from '#/domain/circle/circleName';

abstract class ApplicationError extends ExtendedError {}

export class UserNotFoundApplicationError extends ApplicationError {}

export class CircleDuplicateApplicationError extends ApplicationError {
  constructor(circleName: CircleName, error?: Error) {
    super(`circle name: ${circleName.getValue()} is already exist`, error);
  }
}

export class ArgumentApplicationError extends ApplicationError {}

export class UnknownApplicationError extends ApplicationError {}
