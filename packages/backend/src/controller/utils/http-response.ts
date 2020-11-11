import { Logger } from '../../util/logger';
import { APIGatewayProxyResultV2 } from 'aws-lambda';

export const badRequest = (message: string): APIGatewayProxyResultV2 => {
  return {
    statusCode: 400,
    body: JSON.stringify({ name: 'BadRequest', message }),
  };
};

export const notFound = (message: string): APIGatewayProxyResultV2 => {
  return {
    statusCode: 404,
    body: JSON.stringify({ name: 'NotFound', message }),
  };
};

export const conflict = (message: string): APIGatewayProxyResultV2 => {
  return {
    statusCode: 409,
    body: JSON.stringify({ name: 'Conflict', message }),
  };
};

export const internalServerError = (props: {
  message: string;
  error: Error;
}): APIGatewayProxyResultV2 => {
  Logger.error(props.error);
  return {
    statusCode: 500,
    body: JSON.stringify({
      name: 'InternalServerError',
      message: props.message,
    }),
  };
};
