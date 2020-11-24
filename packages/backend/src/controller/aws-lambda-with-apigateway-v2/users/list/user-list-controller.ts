import { UserListService } from '../../../../application/users/list/user-list-service';
import { UserListServiceInterface } from '../../../../application/users/list/user-list-service-interface';
import { UserListCommand } from '../../../../application/users/list/user-list-command';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Bootstrap } from '../../../utils/bootstrap';
import { badRequest, internalServerError } from '../../../utils/http-response';
import { Logger } from '../../../../util/logger';

export class UserListController {
  private readonly userListService: UserListServiceInterface;
  constructor(props: { userListService: UserListServiceInterface }) {
    this.userListService = props.userListService;
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

    const command = new UserListCommand({ limit: castedLimit, nextToken });
    const users = await this.userListService
      .handle(command)
      .catch((error: Error) => error);

    if (users instanceof Error) {
      const error = users;
      Logger.error(error);
      return internalServerError({ message: 'list user failed', error });
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
const userIndexService = new UserListService({
  userRepository: bootstrap.getUserRepository(),
});
const userIndexController = new UserListController({
  userListService: userIndexService,
});

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => await userIndexController.handle(event);
