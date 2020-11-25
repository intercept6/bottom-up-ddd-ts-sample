import { RegisterUserService } from '../../../../application/users/register/register-user-service';
import { RegisterUserCommand } from '../../../../application/users/register/register-user-command';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserDuplicateApplicationError } from '../../../../application/errors/application-errors';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  conflict,
  internalServerError,
} from '../../../utils/http-response';
import { RegisterUserServiceInterface } from '../../../../application/users/register/register-user-service-interface';

export class RegisterUserController {
  private readonly registerUserService: RegisterUserServiceInterface;
  constructor(props: { registerUserService: RegisterUserServiceInterface }) {
    this.registerUserService = props.registerUserService;
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
      const command = new RegisterUserCommand({ userName, mailAddress });
      const userData = await this.registerUserService
        .handle(command)
        .catch((error: Error) => error);

      if (userData instanceof Error) {
        const error = userData;
        if (error instanceof UserDuplicateApplicationError) {
          return conflict(error.message);
        }
        return internalServerError({
          message: 'Failed to register user',
          error,
        });
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
const registerUserService = new RegisterUserService({
  userRepository: bootstrap.getUserRepository(),
});
const registerUserController = new RegisterUserController({
  registerUserService,
});

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> =>
  await registerUserController.handle(event);
