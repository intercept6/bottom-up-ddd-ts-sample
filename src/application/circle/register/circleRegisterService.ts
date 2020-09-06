import { CircleRepositoryInterface } from '#/repository/circle/circleRepositoryInterface';
import { CircleService } from '#/domain/models/services/circleService';
import { UserRepositoryInterface } from '#/repository/user/userRepositoryInterface';
import { CircleRegisterCommand } from '#/application/circle/register/circleRegisterCommand';
import { UserId } from '#/domain/models/user/userId';
import { UserNotFoundException } from '#/util/error';
import {
  CircleDuplicateApplicationError,
  UnknownApplicationError,
  UserNotFoundApplicationError,
} from '#/application/error/error';
import { CircleName } from '#/domain/circle/circleName';
import { Circle } from '#/domain/circle/circle';
import { CircleRegisterServiceInterface } from '#/application/circle/register/circleRegisterServiceInterface';

export class CircleRegisterService implements CircleRegisterServiceInterface {
  private readonly circleRepository: CircleRepositoryInterface;
  private readonly userRepository: UserRepositoryInterface;
  private readonly circleService: CircleService;

  constructor(props: {
    circleRepository: CircleRepositoryInterface;
    userRepository: UserRepositoryInterface;
  }) {
    this.circleRepository = props.circleRepository;
    this.circleService = new CircleService(props.circleRepository);
    this.userRepository = props.userRepository;
  }

  async handle(command: CircleRegisterCommand) {
    const ownerId = new UserId(command.getUserId());
    const owner = await this.userRepository
      .find(ownerId)
      .catch((error: Error) => error);
    if (owner instanceof Error) {
      const error = owner;
      if (error instanceof UserNotFoundException) {
        throw new UserNotFoundApplicationError(
          'user is not found for become circle owner',
          error
        );
      }
      throw new UnknownApplicationError('', error);
    }

    const newCircleName = new CircleName(command.getCircleName());
    if (await this.circleService.unique(newCircleName)) {
      throw new CircleDuplicateApplicationError(newCircleName);
    }
    const circle = new Circle(newCircleName, owner, []);
    await this.circleRepository.create(circle);
  }
}
