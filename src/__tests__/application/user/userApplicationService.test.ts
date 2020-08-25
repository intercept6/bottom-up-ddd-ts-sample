import { UserApplicationService } from '#/application/user/userApplicationService';
import { InMemoryUserRepository } from '#/repository/user/inMemory/inMemoryUserRepository';

describe('ユーザ新規作成', () => {
  test('ユーザを新規作成する', async () => {
    const userRepository = new InMemoryUserRepository();
    const userApplicationService = new UserApplicationService(userRepository);
    await userApplicationService.createUser('テストユーザーの名前');

    const head = userRepository.store[0];
    expect(head.getName().getValue()).toEqual('テストユーザーの名前');
  });

  test('ユーザ名が3文字未満', async () => {
    const userRepository = new InMemoryUserRepository();
    const userApplicationService = new UserApplicationService(userRepository);
    const createUserPromise = userApplicationService.createUser('テス');

    await expect(createUserPromise).rejects.toThrow('ユーザ名は3文字以上です');
  });

  test('ユーザ名が20文字超過', async () => {
    const userRepository = new InMemoryUserRepository();
    const userApplicationService = new UserApplicationService(userRepository);
    const createUserPromise = userApplicationService.createUser(
      'テストユーザの名前テストユーザの名前テスト'
    );

    await expect(createUserPromise).rejects.toThrow('ユーザ名は20文字以下です');
  });
});
