import { User } from '#/domain/models/user/user';
import type { UserRepository } from '#/repository/user/userRepositoryInterface';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async exists(user: User) {
    const found = await this.userRepository.find(user.getName());
    return found != null;
  }
}
