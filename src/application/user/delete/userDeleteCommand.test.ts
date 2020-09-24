import { UserDeleteService } from '#/application/user/delete/userDeleteService';
import { InMemoryUserRepository } from '#/repository/user/inMemoryUserRepository';
import { User } from '#/domain/models/user/user';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { UserDeleteCommand } from '#/application/user/delete/userDeleteCommand';

describe('ユーザ削除', () => {
  test('ユーザを削除する', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );
    const userDeleteService = new UserDeleteService(userRepository);
    const command = new UserDeleteCommand(
      '203881e1-99f2-4ce6-ab6b-785fcd793c92'
    );
    await userDeleteService.handle(command);

    expect(userRepository.store).toHaveLength(0);
  });

  test('存在しないユーザを削除できる', async () => {
    const userRepository = new InMemoryUserRepository();
    const userDeleteService = new UserDeleteService(userRepository);
    const command = new UserDeleteCommand(
      '203881e1-99f2-4ce6-ab6b-785fcd793c92'
    );
    await userDeleteService.handle(command);

    expect(userRepository.store).toHaveLength(0);
  });
});
