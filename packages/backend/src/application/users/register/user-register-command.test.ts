import { UserRegisterCommand } from './user-register-command';
import { User } from '../../../domain/models/users/user';
import { UserId } from '../../../domain/models/users/user-id';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { UserRegisterService } from './user-register-service';
import {
  ArgumentApplicationError,
  UserDuplicateApplicationError,
} from '../../errors/application-errors';
import { StubUserRepository } from '../../../repository/stub/users/stub-user-repository';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';

const userRepository = new StubUserRepository();
const userRegisterService = new UserRegisterService({ userRepository });

describe('ユーザ新規作成', () => {
  test('ユーザを新規作成する', async () => {
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new UserName(userName))
      );
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new MailAddress(mailAddress))
      );
    jest.spyOn(StubUserRepository.prototype, 'create').mockResolvedValueOnce();

    const command = new UserRegisterCommand({ userName, mailAddress });
    await userRegisterService.handle(command);
  });

  test('ユーザ名が3文字未満', async () => {
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

  test('ユーザー名は重複できない', async () => {
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId('421ae051-5e0e-4ee7-9c47-763d2913c027'),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );
    const userRegisterService = new UserRegisterService({ userRepository });
    const command = new UserRegisterCommand({ userName, mailAddress });
    const registerPromise = userRegisterService.handle(command);

    await expect(registerPromise).rejects.toThrowError(
      new UserDuplicateApplicationError(new UserName(userName))
    );
  });

  test('メールアドレスは重複できない', async () => {
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new UserName(userName))
      );
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId('421ae051-5e0e-4ee7-9c47-763d2913c027'),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );
    const userRegisterService = new UserRegisterService({ userRepository });
    const command = new UserRegisterCommand({ userName, mailAddress });
    const registerPromise = userRegisterService.handle(command);

    await expect(registerPromise).rejects.toThrowError(
      new UserDuplicateApplicationError(new MailAddress(mailAddress))
    );
  });
});
