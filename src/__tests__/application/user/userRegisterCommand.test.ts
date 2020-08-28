import { InMemoryUserRepository } from '#/repository/user/inMemory/inMemoryUserRepository';
import { UserRegisterCommand } from '#/application/user/register/userRegisterCommand';
import { ArgumentException, UserDuplicateException } from '#/util/error';
import { User } from '#/domain/models/user/user';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { UserRegisterService } from '#/application/user/register/userRegisterService';

describe('ユーザ新規作成', () => {
  test('ユーザを新規作成する', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand(
      'テストユーザーの名前',
      'test@example.com'
    );
    await userRegisterService.handle(command);

    const head = userRepository.store[0];
    expect(head.getName().getValue()).toEqual('テストユーザーの名前');
  });

  test('ユーザ名が3文字未満', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand('テス', 'test@example.com');
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentException('ユーザ名は3文字以上です')
    );
  });

  test('ユーザ名が20文字超過', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand(
      'テストユーザの名前テストユーザの名前テスト',
      'test@example.com'
    );
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentException('ユーザ名は20文字以下です')
    );
  });

  test('ユーザ名に許可されない英語小文字が使われている', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand('test', 'test@example.com');
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentException('許可されていない文字 test が使われています。')
    );
  });

  test('ユーザ名に許可されない英語大文字が使われている', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand('TEST', 'test@example.com');
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentException('許可されていない文字 TEST が使われています。')
    );
  });

  test('ユーザ名に許可されない英語大文字が使われている', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand('TEST', 'test@example.com');
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentException('許可されていない文字 TEST が使われています。')
    );
  });

  test('メールアドレスは重複できない', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );

    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand(
      'テストユーザーの名前',
      'test@example.com'
    );
    const registerPromise = userRegisterService.handle(command);

    await expect(registerPromise).rejects.toThrowError(
      new UserDuplicateException(new MailAddress('test@example.com'))
    );
  });
});
