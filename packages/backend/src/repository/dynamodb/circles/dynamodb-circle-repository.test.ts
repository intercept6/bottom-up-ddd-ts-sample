import { DynamodbCircleRepository } from './dynamodb-circle-repository';
import { DynamodbLocalHelper } from '../../../lib/tests/dynamodb-local-helper';
import { Circle } from '../../../domain/models/circles/circle';
import { CircleName } from '../../../domain/models/circles/circle-name';
import { UserId } from '../../../domain/models/users/user-id';
import { CircleId } from '../../../domain/models/circles/circle-id';
import { CircleNotFoundRepositoryError } from '../../errors/repository-errors';
import { Credentials, DynamoDB } from 'aws-sdk';

/**
 * AWS SDKによるDynamoDBの操作はKeyConditionExpressionなど型の恩恵を受けられない場合が多い
 * なので、DynamoDB Localを使い記述が正しいかテストする。
 */

const tableName = 'test-circle-repository';
const gsi1Name = 'gsi1';
const gsi2Name = 'gsi2';
const gsi3Name = 'gsi3';

let dynamoDBLocalHelper: DynamodbLocalHelper;
let dynamoDBCircleRepository: DynamodbCircleRepository;
const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});

beforeEach(async () => {
  dynamoDBLocalHelper = await DynamodbLocalHelper.create({
    tableName,
    gsi1Name,
    gsi2Name,
    gsi3Name,
  }).catch((error: Error) => {
    throw error;
  });
  dynamoDBCircleRepository = new DynamodbCircleRepository({
    tableName,
    gsi1Name,
    documentClient: dynamoDBLocalHelper.getDocumentClient(),
  });
});

afterEach(async () => {
  await dynamoDBLocalHelper.destructor();
});

describe('サークルリポジトリへのCRUDテスト', () => {
  test('サークルを作成する', async () => {
    const circleId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const circleName = 'テストサークル名';
    const ownerId = '78725398-93de-4caa-af55-68a4888416ec';
    const memberIds = ['f4ecef9c-afc3-45ba-9262-58af2f5e9958'];
    await dynamoDBCircleRepository.register(
      Circle.create(
        new CircleId(circleId),
        new CircleName(circleName),
        new UserId(ownerId),
        memberIds.map((value) => new UserId(value))
      )
    );
  });

  test('サークルをサークルIDで取得する', async () => {
    const circleId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const circleName = 'テストサークル名';
    const ownerId = '78725398-93de-4caa-af55-68a4888416ec';
    const memberIds = ['f4ecef9c-afc3-45ba-9262-58af2f5e9958'];
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: circleId,
          gsi1pk: circleName,
          ownerId,
          memberIds,
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    const response = await dynamoDBCircleRepository.get(new CircleId(circleId));

    expect(response.getCircleId().getValue()).toEqual(circleId);
    expect(response.getCircleName().getValue()).toEqual(circleName);
    expect(response.getOwnerId().getValue()).toEqual(ownerId);
    expect(response.getMemberIds().map((value) => value.getValue())).toEqual(
      expect.arrayContaining(memberIds)
    );
  });

  test('サークルをサークル名で取得する', async () => {
    const circleId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const circleName = 'テストサークル名';
    const ownerId = '78725398-93de-4caa-af55-68a4888416ec';
    const memberIds = ['f4ecef9c-afc3-45ba-9262-58af2f5e9958'];
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: circleId,
          gsi1pk: circleName,
          ownerId,
          memberIds,
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    const response = await dynamoDBCircleRepository.get(
      new CircleName(circleName)
    );

    expect(response.getCircleId().getValue()).toEqual(circleId);
    expect(response.getCircleName().getValue()).toEqual(circleName);
    expect(response.getOwnerId().getValue()).toEqual(ownerId);
    expect(response.getMemberIds().map((value) => value.getValue())).toEqual(
      expect.arrayContaining(memberIds)
    );
  });

  test('サークル名を更新する', async () => {
    const circleId = 'ce6180d5-8e3e-4d26-be46-4955aa5e0d1c';
    const circleName = 'テストサークル名';
    const ownerId = '78725398-93de-4caa-af55-68a4888416ec';
    const memberIds = ['f4ecef9c-afc3-45ba-9262-58af2f5e9958'];
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: circleId,
          gsi1pk: circleName,
          ownerId,
          memberIds,
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    await dynamoDBCircleRepository.update(
      Circle.create(
        new CircleId(circleId),
        new CircleName('更新されたサークル名'),
        new UserId(ownerId),
        memberIds.map((value) => new UserId(value))
      )
    );
  });

  test('サークルオーナーを更新する', async () => {
    const circleId = 'ce6180d5-8e3e-4d26-be46-4955aa5e0d1c';
    const circleName = 'テストサークル名';
    const ownerId = '78725398-93de-4caa-af55-68a4888416ec';
    const memberIds = ['f4ecef9c-afc3-45ba-9262-58af2f5e9958'];
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: circleId,
          gsi1pk: circleName,
          ownerId,
          memberIds,
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    await dynamoDBCircleRepository.update(
      Circle.create(
        new CircleId(circleId),
        new CircleName(circleName),
        new UserId('916eb8ef-712b-4613-841d-2e5ed6ad5fa9'),
        memberIds.map((value) => new UserId(value))
      )
    );
  });

  test('存在しないサークルは取得できない', async () => {
    const circleId = 'f1ee26d0-77bd-46f2-8c7f-60c9d617fded';
    const deleteCirclePromise = dynamoDBCircleRepository.get(
      new CircleId(circleId)
    );

    await expect(deleteCirclePromise).rejects.toThrowError(
      new CircleNotFoundRepositoryError(new CircleId(circleId))
    );
  });

  test('存在しないサークルを削除できる', async () => {
    const circleId = '5666d306-0942-4a82-b059-a5fa4f1439b5';
    const circleName = 'テストサークル名';
    const ownerId = 'cc857edd-17b7-42dc-aded-ce683612b629';
    const memberIds = ['6f8b68b3-2a3e-4be7-bdfe-ca71fc9bb675'];
    await dynamoDBCircleRepository.delete(
      Circle.create(
        new CircleId(circleId),
        new CircleName(circleName),
        new UserId(ownerId),
        memberIds.map((value) => new UserId(value))
      )
    );
  });
});
