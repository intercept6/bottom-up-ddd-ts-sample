import { APIGatewayProxyResult } from 'aws-lambda';
import { systemLog } from '#/util/systemLog';

export const catchErrorDecorator = (
  target: Object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>
) => {
  const method = descriptor.value;

  descriptor.value = async function (...args: any) {
    return await method.apply(this, args).catch((error: Error) => {
      if (error.name === 'BadRequest') {
        return {
          statusCode: 400,
          body: JSON.stringify({ name: error.name, message: error.message }),
        } as APIGatewayProxyResult;
      } else if (error.name === 'InternalServerError') {
        return {
          statusCode: 500,
          body: JSON.stringify({ name: error.name, message: error.message }),
        } as APIGatewayProxyResult;
      } else {
        systemLog('ERROR', error.message);
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
