import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDBCircleRepository } from '#/repository/circle/dynamoDBCircleRepository';
import { CircleGetService } from '#/application/circle/get/circleGetService';
import { CircleGetServiceInterface } from '#/application/circle/get/circleGetServiceInterface';
import { APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, NotFound } from '#/awsServerless/errors/error';
import { CircleGetCommand } from '#/application/circle/get/circleGetCommand';
import { CircleNotFoundApplicationError } from '#/application/error/error';
import { UnknownError } from '#/util/error';
import { catchErrorDecorator } from '#/awsServerless/decorators/decorator';

const region = process.env.AWS_REGION ?? 'ap-northeast-1';

const documentClient = new DocumentClient({ apiVersion: '2012-08-10', region });
const tableName = process.env.MAIN_TABLE_NAME ?? 'bottom-up-ddd';

type CircleGetEvent = {
  pathParameters?: { circleId?: string };
};

const circleRepository = new DynamoDBCircleRepository({
  documentClient,
  tableName,
  gsi1Name: 'gsi1',
});

export class CircleGetController {
  constructor(private readonly circleGetService: CircleGetServiceInterface) {}

  @catchErrorDecorator
  async handle(event: CircleGetEvent): Promise<APIGatewayProxyResult> {
    const circleId = event.pathParameters?.circleId;

    if (typeof circleId !== 'string') {
      throw new BadRequest('circle id type is not string');
    }

    const command = new CircleGetCommand(circleId);
    const response = await this.circleGetService
      .handle(command)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;
      if (error instanceof CircleNotFoundApplicationError) {
        throw new NotFound(`circle id: ${circleId} is notfound`);
      }
      throw new UnknownError('unknown error', error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        circle_id: response.getCircleId(),
        circle_name: response.getCircleName(),
        owner_id: response.getOwnerId(),
        member_ids: response.getMemberIds(),
      }),
    };
  }
}
const circleGetService = new CircleGetService({ circleRepository });
const circleGetController = new CircleGetController(circleGetService);

export const handle = async (event: CircleGetEvent) =>
  await circleGetController.handle(event);
