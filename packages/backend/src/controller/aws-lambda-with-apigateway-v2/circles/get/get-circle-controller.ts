import 'source-map-support/register';
import { GetCircleService } from '../../../../application/circles/get/get-circle-service';
import { GetCircleServiceInterface } from '../../../../application/circles/get/get-circle-service-interface';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCircleCommand } from '../../../../application/circles/get/get-circle-command';
import { CircleNotFoundApplicationError } from '../../../../application/errors/application-errors';
import { UnknownError } from '../../../../util/error';
import { Bootstrap } from '../../../utils/bootstrap';
import { badRequest, notFound } from '../../../utils/http-response';

export class GetCircleController {
  constructor(private readonly getCircleService: GetCircleServiceInterface) {}

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const circleId = event.pathParameters?.circleId;

    if (typeof circleId !== 'string') {
      return badRequest('circle id type is not string');
    }

    const command = new GetCircleCommand(circleId);
    const response = await this.getCircleService
      .handle(command)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;
      if (error instanceof CircleNotFoundApplicationError) {
        return notFound(`circle id: ${circleId} is notfound`);
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

const bootstrap = new Bootstrap();
const getCircleService = new GetCircleService({
  circleRepository: bootstrap.getCircleRepository(),
});
const getCircleController = new GetCircleController(getCircleService);

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => await getCircleController.handle(event);
