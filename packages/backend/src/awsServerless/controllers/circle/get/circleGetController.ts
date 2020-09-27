import { CircleGetService } from '../../../../application/circle/get/circleGetService';
import { CircleGetServiceInterface } from '../../../../application/circle/get/circleGetServiceInterface';
import { APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, NotFound } from '../../../errors/error';
import { CircleGetCommand } from '../../../../application/circle/get/circleGetCommand';
import { CircleNotFoundApplicationError } from '../../../../application/error/error';
import { UnknownError } from '../../../../util/error';
import { catchErrorDecorator } from '../../../decorators/decorator';
import { bootstrap } from '../../../utils/bootstrap';

type CircleGetEvent = {
  pathParameters?: { circleId?: string };
};

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

const { circleRepository } = bootstrap();
const circleGetService = new CircleGetService({ circleRepository });
const circleGetController = new CircleGetController(circleGetService);

export const handle = async (event: CircleGetEvent) =>
  await circleGetController.handle(event);
