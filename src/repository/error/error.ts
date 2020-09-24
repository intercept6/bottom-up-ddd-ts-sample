import { ExtendedError } from '#/util/error';
import { CircleName } from '#/domain/circle/circleName';
import { CircleId } from '#/domain/circle/circleId';

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

export class CircleNotFoundException extends ExtendedError {
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

export class TypeException extends ExtendedError {
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
export class UnknownError extends ExtendedError {}
