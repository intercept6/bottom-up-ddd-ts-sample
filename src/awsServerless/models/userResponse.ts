/* eslint-disable camelcase */

export type UserGetResponse = {
  user_id: string;
  user_name: string;
  mail_address: string;
};

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
