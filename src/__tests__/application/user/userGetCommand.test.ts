import { InMemoryUserRepository } from '#/repository/user/inMemory/inMemoryUserRepository';
import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { UserGetCommand } from '#/application/user/userGetCommand';
import { UserId } from '#/domain/models/user/userId';
import { UserApplicationService } from '#/application/user/userApplicationService';
import { UserNotFoundException } from '#/util/error';

describe('ユーザー取得', () => {
  test('ユーザーIDでユーザーを取得する', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );
    const userApplicationService = new UserApplicationService(userRepository);
    const command = new UserGetCommand({
      id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    });
    const response = await userApplicationService.get(command);

    expect(response.getId()).toEqual('203881e1-99f2-4ce6-ab6b-785fcd793c92');
    expect(response.getName()).toEqual('テストユーザーの名前');
    expect(response.getMailAddress()).toEqual('test@example.com');
  });

  test('メールアドレスでユーザーを取得する', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );
    const userApplicationService = new UserApplicationService(userRepository);
    const command = new UserGetCommand({ mailAddress: 'test@example.com' });
    const response = await userApplicationService.get(command);

    expect(response.getId()).toEqual('203881e1-99f2-4ce6-ab6b-785fcd793c92');
    expect(response.getName()).toEqual('テストユーザーの名前');
    expect(response.getMailAddress()).toEqual('test@example.com');
  });

  test('存在しないユーザーIDではユーザーの取得に失敗する', async () => {
    const userRepository = new InMemoryUserRepository();
    const userApplicationService = new UserApplicationService(userRepository);
    const command = new UserGetCommand({
      id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    });
    const getPromise = userApplicationService.get(command);

    await expect(getPromise).rejects.toThrowError(
      new UserNotFoundException(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92')
      )
    );
  });

  test('存在しないメールアドレスではユーザーの取得に失敗する', async () => {
    const userRepository = new InMemoryUserRepository();
    const userApplicationService = new UserApplicationService(userRepository);
    const command = new UserGetCommand({ mailAddress: 'test@example.com' });
    const getPromise = userApplicationService.get(command);

    await expect(getPromise).rejects.toThrowError(
      new UserNotFoundException(new MailAddress('test@example.com'))
    );
  });
});
