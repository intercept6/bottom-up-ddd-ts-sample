import 'source-map-support/register';
import { UpdateCircleServiceInterface } from '../../../../application/circles/update/updateCircleServiceInterface';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Bootstrap } from '../../../utils/bootstrap';
import { UpdateCircleService } from '../../../../application/circles/update/update-circle-service';
import { UpdateCircleCommand } from '../../../../application/circles/update/update-circle-command';
import { isStringArray } from '../../../../util/type-guard';
import {
  CircleNotFoundApplicationError,
  MembersNotFoundApplicationError,
  OwnerNotFoundApplicationError,
} from '../../../../application/errors/application-errors';
import { badRequest, internalServerError } from '../../../utils/http-response';

export class UpdateCircleController {
  private readonly updateCircleService: UpdateCircleServiceInterface;

  constructor(props: {
    readonly updateCircleService: UpdateCircleServiceInterface;
  }) {
    this.updateCircleService = props.updateCircleService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    if (event.body == null) {
      return badRequest('request body is null');
    }

    const circleId = event.pathParameters?.circleId;
    if (typeof circleId !== 'string') {
      return badRequest('circle id type is not string');
    }

    const body = JSON.parse(event.body);
    const circleName = body.circle_name;
    const ownerId = body.owner_id;
    const memberIds = body.member_ids;

    if (circleName == null && ownerId == null && memberIds == null) {
      return badRequest('circle_name, owner_id or member_ids are undefined');
    }
    if (circleName != null && typeof circleName !== 'string') {
      return badRequest('circle_name type is not string');
    }
    if (ownerId != null && typeof ownerId !== 'string') {
      return badRequest('owner_id type is not string');
    }
    if (memberIds != null && !isStringArray(memberIds)) {
      return badRequest('member_ids type is not string[]');
    }

    const command = new UpdateCircleCommand({
      circleId,
      circleName,
      ownerId,
      memberIds,
    });

    const error = await this.updateCircleService
      .handle(command)
      .catch((error: Error) => error);

    if (error instanceof Error) {
      if (error instanceof CircleNotFoundApplicationError) {
        return badRequest(`circle id: ${circleId} is not found`);
      }
      if (error instanceof OwnerNotFoundApplicationError) {
        return badRequest(`owner id: ${ownerId} is not found`);
      }
      if (error instanceof MembersNotFoundApplicationError) {
        return badRequest(error.message);
      }
      return internalServerError({ message: 'circle update is failed', error });
    }
    return {
      statusCode: 204,
      body: JSON.stringify({}),
    };
  }
}

const bootstrap = new Bootstrap();
const updateCircleService = new UpdateCircleService({
  circleRepository: bootstrap.getCircleRepository(),
  userRepository: bootstrap.getUserRepository(),
});
const updateCircleController = new UpdateCircleController({
  updateCircleService,
});

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> =>
  await updateCircleController.handle(event);
