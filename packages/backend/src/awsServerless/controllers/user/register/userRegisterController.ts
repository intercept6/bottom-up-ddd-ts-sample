import { UserRegisterService } from '../../../../application/user/register/userRegisterService';
import { UserRegisterCommand } from '../../../../application/user/register/userRegisterCommand';
import { APIGatewayProxyResult } from 'aws-lambda';
import { UserDuplicateApplicationError } from '../../../../application/error/error';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  conflict,
  internalServerError,
} from '../../../utils/httpResponse';

type UserRegisterEvent = {
  body: string;
};

export class UserRegisterController {
  constructor(private readonly userRegisterService: UserRegisterService) {}

  async handle(event: UserRegisterEvent): Promise<APIGatewayProxyResult> {
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
        headers: { location: `${rootURI}users/${userData.getId()}` },
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
const userRegisterController = new UserRegisterController(userRegisterService);

export const handle = async (event: UserRegisterEvent) =>
  await userRegisterController.handle(event);
