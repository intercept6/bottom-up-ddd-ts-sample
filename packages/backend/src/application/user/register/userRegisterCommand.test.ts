import { InMemoryUserRepository } from '../../../repository/user/inMemoryUserRepository';
import { UserRegisterCommand } from './userRegisterCommand';
import { User } from '../../../domain/models/user/user';
import { UserId } from '../../../domain/models/user/userId';
import { UserName } from '../../../domain/models/user/userName';
import { MailAddress } from '../../../domain/models/user/mailAddress';
import { UserRegisterService } from './userRegisterService';
import {
  ArgumentApplicationError,
  UserDuplicateApplicationError,
} from '../../error/error';

describe('ユーザ新規作成', () => {
  test('ユーザを新規作成する', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand({
      userName: 'テストユーザーの名前',
      mailAddress: 'test@example.com',
    });
    await userRegisterService.handle(command);

    const head = userRepository.store[0];
    expect(head.getName().getValue()).toEqual('テストユーザーの名前');
  });

  test('ユーザ名が3文字未満', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand({
      userName: 'テス',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError('ユーザ名は3文字以上です')
    );
  });

  test('ユーザ名が20文字超過', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand({
      userName: 'テストユーザの名前テストユーザの名前テスト',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError('ユーザ名は20文字以下です')
    );
  });

  test('ユーザ名に許可されない英語小文字が使われている', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand({
      userName: 'test',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError(
        '許可されていない文字 test が使われています。'
      )
    );
  });

  test('ユーザ名に許可されない英語大文字が使われている', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand({
      userName: 'TEST',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError(
        '許可されていない文字 TEST が使われています。'
      )
    );
  });

  test('ユーザ名に許可されない英語大文字が使われている', async () => {
    const userRepository = new InMemoryUserRepository();
    const userRegisterService = new UserRegisterService(userRepository);
    const command = new UserRegisterCommand({
      userName: 'TEST',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = userRegisterService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError(
        '許可されていない文字 TEST が使われています。'
      )
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
    const command = new UserRegisterCommand({
      userName: '重複しないユーザーの名前',
      mailAddress: 'test@example.com',
    });
    const registerPromise = userRegisterService.handle(command);

    await expect(registerPromise).rejects.toThrowError(
      new UserDuplicateApplicationError(new MailAddress('test@example.com'))
    );
  });
});
