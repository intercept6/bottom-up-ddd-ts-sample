import { ListUserService } from '../../../../application/users/list/list-user-service';
import { ListUserServiceInterface } from '../../../../application/users/list/list-user-service-interface';
import { ListUserCommand } from '../../../../application/users/list/list-user-command';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Bootstrap } from '../../../utils/bootstrap';
import { badRequest, internalServerError } from '../../../utils/http-response';
import { Logger } from '../../../../util/logger';

export class ListUserController {
  private readonly listUserService: ListUserServiceInterface;
  constructor(props: { listUserService: ListUserServiceInterface }) {
    this.listUserService = props.listUserService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const nextToken = event?.queryStringParameters?.['next-token'];
    const limit = event?.queryStringParameters?.limit;
    const castedLimit = Number(limit);

    if (limit != null && isNaN(castedLimit)) {
      return badRequest('Limit type is not number');
    }
    if (castedLimit > 100) {
      return badRequest('Cannot get users more than 100');
    }

    const command = new ListUserCommand({ limit: castedLimit, nextToken });
    const users = await this.listUserService
      .handle(command)
      .catch((error: Error) => error);

    if (users instanceof Error) {
      const error = users;
      return internalServerError({ message: 'Failed to list user', error });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(
        users.map((user) => ({
          user_id: user.getUserId(),
          user_name: user.getUserName(),
          mail_address: user.getMailAddress(),
        }))
      ),
    };
  }
}

const bootstrap = new Bootstrap();
const userIndexService = new ListUserService({
  userRepository: bootstrap.getUserRepository(),
});
const userIndexController = new ListUserController({
  listUserService: userIndexService,
});

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => await userIndexController.handle(event);
