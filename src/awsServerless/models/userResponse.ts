/* eslint-disable camelcase */

export type UserGetRequest = {
  user_id: string;
};

export const isUserGetRequest = (body: object): body is UserGetRequest => {
  return (body as UserGetRequest).user_id != null;
};

export type UserRegisterRequest = {
  user_name: string;
  mail_address: string;
};

export const isUserRegisterRequest = (
  body: object
): body is UserRegisterRequest => {
  return (
    typeof (body as UserRegisterRequest).user_name === 'string' &&
    typeof (body as UserRegisterRequest).mail_address === 'string'
  );
};
