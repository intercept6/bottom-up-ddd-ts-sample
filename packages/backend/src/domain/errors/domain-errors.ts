import { ExtendedError } from '../../util/error';

export abstract class DomainError extends ExtendedError {}

export class ArgumentDomainError extends DomainError {}

export class UnknownDomainError extends DomainError {
  constructor(error: Error) {
    super('unknown domain error', error);
  }
}
