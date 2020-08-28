import { User } from '#/domain/models/user/user';
import type { UserRepository } from '#/repository/user/userRepositoryInterface';
import { UnknownException, UserNotFoundException } from '#/util/error';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async exists(user: User) {
    try {
      await this.userRepository.find(user.getMailAddress());
      return true;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        return false;
      }
      throw new UnknownException(error);
    }
  }
}
