import 'source-map-support/register';
import { CircleDeleteService } from '../../../../application/circle/delete/circleDeleteService';
import { CircleDeleteCommand } from '../../../../application/circle/delete/circleDeleteCommand';
import { CircleNotFoundApplicationError } from '../../../../application/error/error';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../../../utils/httpResponse';

type CircleDeleteEvent = {
  pathParameters?: { circleId?: string };
};

export class CircleDeleteController {
  private readonly circleDeleteService: CircleDeleteService;

  constructor(props: { readonly circleDeleteService: CircleDeleteService }) {
    this.circleDeleteService = props.circleDeleteService;
  }

  async handle(event: CircleDeleteEvent) {
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
