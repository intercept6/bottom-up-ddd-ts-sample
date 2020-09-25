import { ExtendedError } from '#/util/error';

abstract class DomainError extends ExtendedError {}

export class ArgumentDomainError extends DomainError {}
