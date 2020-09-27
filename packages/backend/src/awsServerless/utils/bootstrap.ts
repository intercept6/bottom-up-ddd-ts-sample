import { DynamoDB } from 'aws-sdk';
import { DynamoDBUserRepository } from '../../repository/user/dynamoDBUserRepository';
import { DynamoDBCircleRepository } from '../../repository/circle/dynamoDBCircleRepository';
import { DynamoDBCircleFactory } from '../../repository/circle/dynamoDBCircleFactory';

export const bootstrap = () => {
  const region = process.env.AWS_REGION ?? 'ap-northeast-1';
  const tableName = process.env.MAIN_TABLE_NAME ?? 'bottom-up-ddd';
  const gsi1Name = process.env.MAIL_TABLE_GSI1_NAME ?? 'gsi1';
  const gsi2Name = process.env.MAIL_TABLE_GSI2_NAME ?? 'gsi2';
  const rootURI = process.env.ROOT_URI! ?? '';

  const documentClient = new DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region,
  });

  const userRepository = new DynamoDBUserRepository({
    documentClient,
    tableName,
    gsi1Name,
    gsi2Name,
  });

  const circleRepository = new DynamoDBCircleRepository({
    documentClient,
    tableName,
    gsi1Name,
  });
  const circleFactory = new DynamoDBCircleFactory({
    userRepository,
    circleRepository,
  });

  return {
    rootURI,
    userRepository,
    circleRepository,
    circleFactory,
  };
};
