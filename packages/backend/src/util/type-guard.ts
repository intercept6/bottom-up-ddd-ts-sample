import { User } from '../domain/models/users/user';

function isArray(array: unknown): array is unknown[] {
  return Object.prototype.toString.call(array) === '[object Array]';
}

export function isStringArray(array: unknown): array is string[] {
  if (isArray(array)) {
    return array.findIndex((value) => typeof value !== 'string') === -1;
  } else {
    return false;
  }
}

export function isUserArray(array: unknown): array is User[] {
  if (isArray(array)) {
    return array.findIndex((value) => value instanceof User) === -1;
  } else {
    return false;
  }
}
