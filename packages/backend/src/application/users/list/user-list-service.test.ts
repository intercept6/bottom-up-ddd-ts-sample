import { User } from '../../../domain/models/users/user';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { UserListCommand } from './user-list-command';
import { UserId } from '../../../domain/models/users/user-id';
import { UserListService } from './user-list-service';
import { StubUserRepository } from '../../../repository/stub/users/stub-user-repository';

const userRepository = new StubUserRepository();
const userListService = new UserListService({ userRepository });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ユーザー取得', () => {
  test('ユーザーを取得する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザーの名前';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(StubUserRepository.prototype, 'list')
      .mockResolvedValueOnce([
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        ),
      ]);

    const command = new UserListCommand();
    const response = await userListService.handle(command);

    expect(response[0].getUserId()).toEqual(userId);
    expect(response[0].getUserName()).toEqual(userName);
    expect(response[0].getMailAddress()).toEqual(mailAddress);
  });
});
