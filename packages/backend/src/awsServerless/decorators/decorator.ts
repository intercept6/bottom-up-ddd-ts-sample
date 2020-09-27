import { APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '../../util/logger';
import {
  BadRequest,
  Conflict,
  InternalServerError,
  NotFound,
} from '../errors/error';

export const catchErrorDecorator = (
  target: Object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>
) => {
  const method = descriptor.value;

  descriptor.value = async function (
    ...args: any
  ): Promise<APIGatewayProxyResult> {
    return await method.apply(this, args).catch((error: Error) => {
      if (error instanceof BadRequest) {
        return {
          statusCode: 400,
          body: JSON.stringify({ name: error.name, message: error.message }),
        };
      } else if (error instanceof NotFound) {
        return {
          statusCode: 404,
          body: JSON.stringify({ name: error.name, message: error.message }),
        };
      } else if (error instanceof Conflict) {
        return {
          statusCode: 409,
          body: JSON.stringify({ name: error.name, message: error.message }),
        };
      } else if (error instanceof InternalServerError) {
        return {
          statusCode: 500,
          body: JSON.stringify({ name: error.name, message: error.message }),
        };
      } else {
        Logger.error(error);
        return {
          statusCode: 500,
          body: JSON.stringify({
            name: 'InternalServerError',
            message: 'Unknown error',
          }),
        };
      }
    });
  };

  return descriptor;
};
