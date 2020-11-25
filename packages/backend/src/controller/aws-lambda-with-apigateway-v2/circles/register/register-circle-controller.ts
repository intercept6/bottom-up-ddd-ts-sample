import 'source-map-support/register';
import { RegisterCircleServiceInterface } from '../../../../application/circles/register/register-circle-service-interface';
import { RegisterCircleService } from '../../../../application/circles/register/register-circle-service';
import { RegisterCircleCommand } from '../../../../application/circles/register/register-circle-command';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { CircleDuplicateApplicationError } from '../../../../application/errors/application-errors';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  conflict,
  internalServerError,
} from '../../../utils/http-response';

export class RegisterCircleController {
  private readonly registerCircleService: RegisterCircleServiceInterface;

  constructor(props: {
    readonly registerCircleService: RegisterCircleServiceInterface;
  }) {
    this.registerCircleService = props.registerCircleService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    if (event.body == null) {
      return badRequest('request body is null');
    }

    const body = JSON.parse(event.body);
    const circleName = body.circle_name;
    const ownerId = body.owner_id;

    if (typeof circleName !== 'string') {
      return badRequest('circle_name should be string type');
    }

    if (typeof ownerId !== 'string') {
      return badRequest('owner_id should be string type');
    }

    const command = new RegisterCircleCommand({ ownerId, circleName });
    const response = await this.registerCircleService
      .handle(command)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;

      if (error instanceof CircleDuplicateApplicationError) {
        return conflict(`circle_name ${circleName} is already exist`);
      }
      return internalServerError({ message: 'circle register failed', error });
    }

    return {
      statusCode: 201,
      body: JSON.stringify({}),
      headers: { location: `${rootURI}circles/${response.getCircleId()}` },
    };
  }
}

const bootstrap = new Bootstrap();
const rootURI = bootstrap.getRootURI();
const registerCircleService = new RegisterCircleService({
  circleRepository: bootstrap.getCircleRepository(),
  userRepository: bootstrap.getUserRepository(),
  circleFactory: bootstrap.getCircleFactory(),
});
const registerCircleController = new RegisterCircleController({
  registerCircleService,
});

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> =>
  await registerCircleController.handle(event);
