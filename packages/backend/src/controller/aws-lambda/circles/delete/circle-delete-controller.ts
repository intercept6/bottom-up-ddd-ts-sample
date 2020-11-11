import 'source-map-support/register';
import { CircleDeleteService } from '../../../../application/circles/delete/circle-delete-service';
import { CircleDeleteCommand } from '../../../../application/circles/delete/circle-delete-command';
import { CircleNotFoundApplicationError } from '../../../../application/errors/application-errors';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../../../utils/http-response';
import { Bootstrap } from '../../../utils/bootstrap';
import { CircleDeleteServiceInterface } from '../../../../application/circles/delete/circleDeleteServiceInterface';
import { APIGatewayProxyResultV2 } from 'aws-lambda';

type CircleDeleteEvent = {
  pathParameters?: { circleId?: string };
};

export class CircleDeleteController {
  private readonly circleDeleteService: CircleDeleteServiceInterface;

  constructor(props: {
    readonly circleDeleteService: CircleDeleteServiceInterface;
  }) {
    this.circleDeleteService = props.circleDeleteService;
  }

  async handle(event: CircleDeleteEvent): Promise<APIGatewayProxyResultV2> {
    const circleId = event?.pathParameters?.circleId;
    if (circleId == null) {
      return badRequest('circle id type is not string');
    }

    const command = new CircleDeleteCommand(circleId);
    const error = await this.circleDeleteService
      .handle(command)
      .catch((error: Error) => error);

    if (error instanceof Error) {
      if (error instanceof CircleNotFoundApplicationError) {
        return notFound(`circle id: ${circleId} is not found`);
      }
      return internalServerError({ message: 'circle delete failed', error });
    }

    return { statusCode: 204, body: JSON.stringify({}) };
  }
}

const bootstrap = new Bootstrap();
const circleDeleteService = new CircleDeleteService({
  circleRepository: bootstrap.getCircleRepository(),
});
const circleDeleteController = new CircleDeleteController({
  circleDeleteService,
});

export const handle = async (
  event: CircleDeleteEvent
): Promise<APIGatewayProxyResultV2> =>
  await circleDeleteController.handle(event);
