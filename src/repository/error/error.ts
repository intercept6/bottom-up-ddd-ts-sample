import { ExtendedError } from '#/util/error';
import { CircleName } from '#/domain/circle/circleName';
import { CircleId } from '#/domain/circle/circleId';

export class CircleNotFoundError extends ExtendedError {
  constructor(circleId: CircleId, error?: Error);
  constructor(circleName: CircleName, error?: Error);
  constructor(identifier: CircleId | CircleName, error?: Error) {
    if (identifier instanceof CircleId) {
      super(`circle id: ${identifier.getValue()} is not found`, error);
    } else {
      super(`circle name: ${identifier.getValue()} is not found`, error);
    }
  }
}

export class ArgumentException extends ExtendedError {}

export class UnknownError extends ExtendedError {}
