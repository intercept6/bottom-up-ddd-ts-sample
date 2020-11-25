import { DeleteUserService } from './delete-user-service';
import { DeleteUserCommand } from './delete-user-command';
import { UserRepositoryStub } from '../../../repository/stub/users/user-repository-stub';
import { User } from '../../../domain/models/users/user';
import { UserId } from '../../../domain/models/users/user-id';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';

const userRepository = new UserRepositoryStub();
const deleteUserService = new DeleteUserService({ userRepository });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ユーザ削除', () => {
  test('ユーザを削除する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName('テストユーザー'),
          new MailAddress('test@example.com')
        )
      );
    jest.spyOn(UserRepositoryStub.prototype, 'delete').mockResolvedValueOnce();

    const command = new DeleteUserCommand(userId);
    await deleteUserService.handle(command);
  });

  test('存在しないユーザを削除できる', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new UserId(userId))
      );

    const command = new DeleteUserCommand(userId);
    await deleteUserService.handle(command);
  });
});
