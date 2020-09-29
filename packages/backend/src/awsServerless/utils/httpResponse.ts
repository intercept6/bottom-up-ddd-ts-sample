import { Logger } from '../../util/logger';

export const badRequest = (message: string) => {
  return {
    statusCode: 400,
    body: JSON.stringify({ name: 'BadRequest', message }),
  };
};

export const notFound = (message: string) => {
  return {
    statusCode: 404,
    body: JSON.stringify({ name: 'NotFound', message }),
  };
};

export const conflict = (message: string) => {
  return {
    statusCode: 409,
    body: JSON.stringify({ name: 'Conflict', message }),
  };
};

export const internalServerError = (props: {
  message: string;
  error: Error;
}) => {
  Logger.error(props.error);
  return {
    statusCode: 500,
    body: JSON.stringify({
      name: 'InternalServerError',
      message: props.message,
    }),
  };
};
