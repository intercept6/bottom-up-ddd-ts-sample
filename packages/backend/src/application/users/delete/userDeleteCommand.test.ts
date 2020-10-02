import { UserDeleteService } from './userDeleteService';
import { UserDeleteCommand } from './userDeleteCommand';
import { StubUserRepository } from '../../../repository/stub/users/stubUserRepository';
import { User } from '../../../domain/models/users/user';
import { UserId } from '../../../domain/models/users/userId';
import { UserName } from '../../../domain/models/users/userName';
import { MailAddress } from '../../../domain/models/users/mailAddress';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repositoryErrors';

const userRepository = new StubUserRepository();
const userDeleteService = new UserDeleteService({ userRepository });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ユーザ削除', () => {
  test('ユーザを削除する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName('テストユーザー'),
          new MailAddress('test@example.com')
        )
      );
    jest.spyOn(StubUserRepository.prototype, 'delete').mockResolvedValueOnce();

    const command = new UserDeleteCommand(userId);
    await userDeleteService.handle(command);
  });

  test('存在しないユーザを削除できる', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new UserId(userId))
      );

    const command = new UserDeleteCommand(userId);
    await userDeleteService.handle(command);
  });
});