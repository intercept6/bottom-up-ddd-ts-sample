import 'source-map-support/register';
import { DeleteCircleService } from '../../../../application/circles/delete/delete-circle-service';
import { DeleteCircleCommand } from '../../../../application/circles/delete/delete-circle-command';
import { CircleNotFoundApplicationError } from '../../../../application/errors/application-errors';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../../../utils/http-response';
import { Bootstrap } from '../../../utils/bootstrap';
import { DeleteCircleServiceInterface } from '../../../../application/circles/delete/delete-circle-service-interface';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export class DeleteCircleController {
  private readonly deleteCircleService: DeleteCircleServiceInterface;

  constructor(props: {
    readonly deleteCircleService: DeleteCircleServiceInterface;
  }) {
    this.deleteCircleService = props.deleteCircleService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const circleId = event?.pathParameters?.circleId;
    if (circleId == null) {
      return badRequest('circle id type is not string');
    }

    const command = new DeleteCircleCommand(circleId);
    const error = await this.deleteCircleService
      .handle(command)
      .catch((error: Error) => error);

    if (error instanceof Error) {
      if (error instanceof CircleNotFoundApplicationError) {
        return notFound(`circle id: ${circleId} is not found`);
      }
      return internalServerError({ message: 'Failed to delete circle', error });
    }

    return { statusCode: 204, body: JSON.stringify({}) };
  }
}

const bootstrap = new Bootstrap();
const deleteCircleService = new DeleteCircleService({
  circleRepository: bootstrap.getCircleRepository(),
});
const deleteCircleController = new DeleteCircleController({
  deleteCircleService,
});

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> =>
  await deleteCircleController.handle(event);
