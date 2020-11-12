import 'source-map-support/register';
import { CircleGetService } from '../../../../application/circles/get/circle-get-service';
import { CircleGetServiceInterface } from '../../../../application/circles/get/circle-get-service-interface';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { CircleGetCommand } from '../../../../application/circles/get/circle-get-command';
import { CircleNotFoundApplicationError } from '../../../../application/errors/application-errors';
import { UnknownError } from '../../../../util/error';
import { Bootstrap } from '../../../utils/bootstrap';
import { badRequest, notFound } from '../../../utils/http-response';

export class CircleGetController {
  constructor(private readonly circleGetService: CircleGetServiceInterface) {}

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const circleId = event.pathParameters?.circleId;

    if (typeof circleId !== 'string') {
      return badRequest('circle id type is not string');
    }

    const command = new CircleGetCommand(circleId);
    const response = await this.circleGetService
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
const circleGetService = new CircleGetService({
  circleRepository: bootstrap.getCircleRepository(),
});
const circleGetController = new CircleGetController(circleGetService);

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => await circleGetController.handle(event);
