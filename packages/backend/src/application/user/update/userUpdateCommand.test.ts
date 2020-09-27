import { UserUpdateService } from './userUpdateService';
import { InMemoryUserRepository } from '../../../repository/user/inMemoryUserRepository';
import { User } from '../../../domain/models/user/user';
import { UserId } from '../../../domain/models/user/userId';
import { UserName } from '../../../domain/models/user/userName';
import { MailAddress } from '../../../domain/models/user/mailAddress';
import { UserUpdateCommand } from './userUpdateCommand';
import {
  ArgumentApplicationError,
  UserDuplicateApplicationError,
} from '../../error/error';

describe('ユーザ更新', () => {
  test('ユーザ名を更新する', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );
    const userApplicationService = new UserUpdateService(userRepository);
    const command = new UserUpdateCommand({
      id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      name: '変更されたテストユーザーの名前',
    });
    await userApplicationService.handle(command);

    const head = userRepository.store[0];
    expect(head.getName().getValue()).toEqual('変更されたテストユーザーの名前');
  });

  test('メールアドレスを更新する', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );
    const userApplicationService = new UserUpdateService(userRepository);
    const command = new UserUpdateCommand({
      id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      mailAddress: 'changed@example.com',
    });
    await userApplicationService.handle(command);

    const head = userRepository.store[0];
    expect(head.getMailAddress().getValue()).toEqual('changed@example.com');
  });

  test('ユーザ名が3文字未満', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );
    const userApplicationService = new UserUpdateService(userRepository);
    const command = new UserUpdateCommand({
      id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      name: 'テス',
    });
    const updateUserPromise = userApplicationService.handle(command);

    await expect(updateUserPromise).rejects.toThrowError(
      new ArgumentApplicationError('ユーザ名は3文字以上です')
    );
  });

  test('ユーザ名が20文字超過', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );
    const userApplicationService = new UserUpdateService(userRepository);
    const command = new UserUpdateCommand({
      id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      name: 'テストユーザの名前テストユーザの名前テスト',
    });
    const updateUserPromise = userApplicationService.handle(command);

    await expect(updateUserPromise).rejects.toThrowError(
      new ArgumentApplicationError('ユーザ名は20文字以下です')
    );
  });

  test('ユーザ名に許可されない英語小文字が使われている', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );
    const userApplicationService = new UserUpdateService(userRepository);
    const command = new UserUpdateCommand({
      id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      name: 'test',
    });
    const updateUserPromise = userApplicationService.handle(command);

    await expect(updateUserPromise).rejects.toThrowError(
      new ArgumentApplicationError(
        '許可されていない文字 test が使われています。'
      )
    );
  });

  test('ユーザ名に許可されない英語大文字が使われている', async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.store.push(
      new User(
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        new UserName('テストユーザーの名前'),
        new MailAddress('test@example.com')
      )
    );
    const userApplicationService = new UserUpdateService(userRepository);
    const command = new UserUpdateCommand({
      id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      name: 'TEST',
    });
    const updateUserPromise = userApplicationService.handle(command);

    await expect(updateUserPromise).rejects.toThrowError(
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
    userRepository.store.push(
      new User(
        new UserId('35a16ab7-c756-4dce-8810-59f66fc142cc'),
        new UserName('テストユーザーの名前'),
        new MailAddress('changed@example.com')
      )
    );

    const userApplicationService = new UserUpdateService(userRepository);
    const command = new UserUpdateCommand({
      id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      mailAddress: 'changed@example.com',
    });
    const updatePromise = userApplicationService.handle(command);

    await expect(updatePromise).rejects.toThrowError(
      new UserDuplicateApplicationError(new MailAddress('changed@example.com'))
    );
  });
});
