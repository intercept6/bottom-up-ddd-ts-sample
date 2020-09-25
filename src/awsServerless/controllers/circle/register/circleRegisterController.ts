import { DynamoDB } from 'aws-sdk';
import { CircleRegisterServiceInterface } from '#/application/circle/register/circleRegisterServiceInterface';
import { CircleRegisterService } from '#/application/circle/register/circleRegisterService';
import { DynamoDBCircleRepository } from '#/repository/circle/dynamoDBCircleRepository';
import { DynamoDBUserRepository } from '#/repository/user/dynamoDBUserRepository';
import { DynamoDBCircleFactory } from '#/repository/circle/dynamoDBCircleFactory';
import {
  BadRequest,
  Conflict,
  InternalServerError,
} from '#/awsServerless/errors/error';
import { CircleRegisterCommand } from '#/application/circle/register/circleRegisterCommand';
import { catchErrorDecorator } from '#/awsServerless/decorators/decorator';
import { APIGatewayProxyResult } from 'aws-lambda';
import { CircleDuplicateApplicationError } from '#/application/error/error';

type CircleRegisterEvent = {
  body?: string;
};

const region = process.env.AWS_REGION ?? 'ap-northeast-1';

const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
});
const tableName = process.env.MAIN_TABLE_NAME ?? 'bottom-up-ddd';
const gsi1Name = process.env.MAIL_TABLE_GSI1_NAME ?? 'gsi1';
const gsi2Name = process.env.MAIL_TABLE_GSI2_NAME ?? 'gs21';
const rootURI = process.env.ROOT_URI! ?? '';

export class CircleRegisterController {
  private readonly circleRegisterService: CircleRegisterServiceInterface;

  constructor(props: {
    readonly circleRegisterService: CircleRegisterServiceInterface;
  }) {
    this.circleRegisterService = props.circleRegisterService;
  }

  @catchErrorDecorator
  async handle(event: CircleRegisterEvent): Promise<APIGatewayProxyResult> {
    if (event.body == null) {
      throw new BadRequest('request body is null');
    }

    const body = JSON.parse(event.body);
    const circleName = body.circle_name;
    const ownerId = body.owner_id;

    if (typeof circleName !== 'string') {
      throw new BadRequest('circle_name should be string type');
    }

    if (typeof ownerId !== 'string') {
      throw new BadRequest('owner_id should be string type');
    }

    const command = new CircleRegisterCommand({ ownerId, circleName });
    const response = await this.circleRegisterService
      .handle(command)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;

      if (error instanceof CircleDuplicateApplicationError) {
        throw new Conflict(`circle_name ${circleName} is already exist`, error);
      }
      throw new InternalServerError('circle register failed', error);
    }

    return {
      statusCode: 201,
      body: JSON.stringify({}),
      headers: { location: `${rootURI}/circles/${response.getCircleId()}` },
    };
  }
}

const userRepository = new DynamoDBUserRepository({
  documentClient,
  tableName,
  gsi1Name,
  gsi2Name,
});
const circleRepository = new DynamoDBCircleRepository({
  tableName,
  documentClient,
  gsi1Name,
});
const circleFactory = new DynamoDBCircleFactory({
  userRepository,
  circleRepository,
});
const circleRegisterService = new CircleRegisterService({
  circleRepository,
  userRepository,
  circleFactory,
});

const circleRegisterController = new CircleRegisterController({
  circleRegisterService,
});

export const handle = async (event: CircleRegisterEvent) =>
  await circleRegisterController.handle(event);
