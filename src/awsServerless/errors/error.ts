import { Logger } from '#/util/logger';
import { ExtendedError } from '#/util/error';

abstract class LambdaControllerError extends ExtendedError {}

// 400 Bad Request
export class BadRequest extends LambdaControllerError {}

// 404 Not Found
export class NotFound extends LambdaControllerError {}

// 409 Conflict
export class Conflict extends LambdaControllerError {}

// 500 Internal Server Error
export class InternalServerError extends LambdaControllerError {
  constructor(message: string, error?: Error) {
    Logger.error(error);
    super(message, error);
  }
}
