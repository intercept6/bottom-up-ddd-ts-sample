import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserService } from '#/domain/models/services/userService';
import type { UserRepository } from '#/repository/user/userRepositoryInterface';

export class UserApplicationService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userName: string) {
    const user = new User(new UserName(userName));

    const userService = new UserService(this.userRepository);
    if (await userService.exists(user)) {
      throw new Error(`${userName}は既に存在します`);
    }

    await this.userRepository.save(user);
  }
}
