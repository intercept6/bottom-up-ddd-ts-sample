import { UserRegisterService } from '../../../../application/users/register/user-register-service';
import { UserRegisterCommand } from '../../../../application/users/register/user-register-command';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserDuplicateApplicationError } from '../../../../application/errors/application-errors';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  conflict,
  internalServerError,
} from '../../../utils/http-response';
import { UserRegisterServiceInterface } from '../../../../application/users/register/user-register-service-interface';

export class UserRegisterController {
  private readonly userRegisterService: UserRegisterServiceInterface;
  constructor(props: { userRegisterService: UserRegisterServiceInterface }) {
    this.userRegisterService = props.userRegisterService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    if (event.body == null) {
      return badRequest('request body is null');
    }

    const body = JSON.parse(event.body);
    const userName = body.user_name;
    const mailAddress = body.mail_address;

    if (typeof userName === 'string' && typeof mailAddress === 'string') {
      const command = new UserRegisterCommand({ userName, mailAddress });
      const userData = await this.userRegisterService
        .handle(command)
        .catch((error: Error) => error);

      if (userData instanceof Error) {
        const error = userData;
        if (error instanceof UserDuplicateApplicationError) {
          return conflict(error.message);
        }
        return internalServerError({ message: 'user register failed', error });
      }
      return {
        statusCode: 201,
        body: JSON.stringify({}),
        headers: { location: `${rootURI}users/${userData.getUserId()}` },
      };
    }
    return badRequest('user_name or mail_address is not string');
  }
}

const bootstrap = new Bootstrap();
const rootURI = bootstrap.getRootURI();
const userRegisterService = new UserRegisterService({
  userRepository: bootstrap.getUserRepository(),
});
const userRegisterController = new UserRegisterController({
  userRegisterService,
});

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> =>
  await userRegisterController.handle(event);
