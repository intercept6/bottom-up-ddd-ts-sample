import { User } from '../../../domain/models/users/user';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { ListUserCommand } from './list-user-command';
import { UserId } from '../../../domain/models/users/user-id';
import { ListUserService } from './list-user-service';
import { UserRepositoryStub } from '../../../repository/stub/users/user-repository-stub';

const userRepository = new UserRepositoryStub();
const listUserService = new ListUserService({ userRepository });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ユーザー取得', () => {
  test('ユーザーを取得する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザーの名前';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(UserRepositoryStub.prototype, 'list')
      .mockResolvedValueOnce([
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        ),
      ]);

    const command = new ListUserCommand();
    const response = await listUserService.handle(command);

    expect(response[0].getUserId()).toEqual(userId);
    expect(response[0].getUserName()).toEqual(userName);
    expect(response[0].getMailAddress()).toEqual(mailAddress);
  });
});
