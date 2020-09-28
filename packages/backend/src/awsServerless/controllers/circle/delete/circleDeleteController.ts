import 'source-map-support/register';
import { CircleDeleteService } from '../../../../application/circle/delete/circleDeleteService';
import { catchErrorDecorator } from '../../../decorators/decorator';
import {
  BadRequest,
  InternalServerError,
  NotFound,
} from '../../../errors/error';
import { CircleDeleteCommand } from '../../../../application/circle/delete/circleDeleteCommand';
import { CircleNotFoundApplicationError } from '../../../../application/error/error';

type CircleDeleteEvent = {
  pathParameters?: { circleId?: string };
};

export class CircleDeleteController {
  private readonly circleDeleteService: CircleDeleteService;

  constructor(props: { readonly circleDeleteService: CircleDeleteService }) {
    this.circleDeleteService = props.circleDeleteService;
  }

  @catchErrorDecorator
  async handle(event: CircleDeleteEvent) {
    const circleId = event?.pathParameters?.circleId;
    if (circleId == null) {
      throw new BadRequest('circle id type is not string');
    }

    const command = new CircleDeleteCommand(circleId);
    const error = await this.circleDeleteService
      .handle(command)
      .catch((error: Error) => error);

    if (error instanceof Error) {
      if (error instanceof CircleNotFoundApplicationError) {
        throw new NotFound(`circle id: ${circleId} is not found`);
      }
      throw new InternalServerError('circle delete failed');
    }

    return { statusCode: 204, body: JSON.stringify({}) };
  }
}
