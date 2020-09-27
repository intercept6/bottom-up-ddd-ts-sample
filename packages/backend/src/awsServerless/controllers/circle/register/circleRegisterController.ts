import { CircleRegisterServiceInterface } from '../../../../application/circle/register/circleRegisterServiceInterface';
import { CircleRegisterService } from '../../../../application/circle/register/circleRegisterService';
import {
  BadRequest,
  Conflict,
  InternalServerError,
} from '../../../errors/error';
import { CircleRegisterCommand } from '../../../../application/circle/register/circleRegisterCommand';
import { catchErrorDecorator } from '../../../decorators/decorator';
import { APIGatewayProxyResult } from 'aws-lambda';
import { CircleDuplicateApplicationError } from '../../../../application/error/error';
import { bootstrap } from '../../../utils/bootstrap';

type CircleRegisterEvent = {
  body?: string;
};

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

const {
  circleFactory,
  circleRepository,
  userRepository,
  rootURI,
} = bootstrap();

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
