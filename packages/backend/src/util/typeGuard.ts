import { User } from '../domain/models/user/user';

function isArray(array: any): array is any[] {
  return Object.prototype.toString.call(array) === '[object Array]';
}

export function isStringArray(array: any): array is string[] {
  if (isArray(array)) {
    return array.findIndex((value) => typeof value !== 'string') === -1;
  } else {
    return false;
  }
}

export function isUserArray(array: any): array is User[] {
  if (isArray(array)) {
    return array.findIndex((value) => value instanceof User) === -1;
  } else {
    return false;
  }
}
