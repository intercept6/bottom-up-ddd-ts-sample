import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';
import { CircleService } from '#/domain/models/services/circleService';
import { UserRepositoryInterface } from '#/domain/models/user/userRepositoryInterface';
import { CircleRegisterCommand } from '#/application/circle/register/circleRegisterCommand';
import { UserId } from '#/domain/models/user/userId';
import { UserNotFoundException } from '#/util/error';
import {
  CircleDuplicateApplicationError,
  UnknownApplicationError,
  UserNotFoundApplicationError,
} from '#/application/error/error';
import { CircleName } from '#/domain/circle/circleName';
import { CircleRegisterServiceInterface } from '#/application/circle/register/circleRegisterServiceInterface';
import { CircleFactoryInterface } from '#/domain/circle/circleFactoryInterface';

export class CircleRegisterService implements CircleRegisterServiceInterface {
  private readonly circleRepository: CircleRepositoryInterface;
  private readonly userRepository: UserRepositoryInterface;
  private readonly circleService: CircleService;
  private readonly circleFactory: CircleFactoryInterface;

  constructor(props: {
    circleRepository: CircleRepositoryInterface;
    userRepository: UserRepositoryInterface;
    circleFactory: CircleFactoryInterface;
  }) {
    this.circleRepository = props.circleRepository;
    this.circleService = new CircleService(props.circleRepository);
    this.userRepository = props.userRepository;
    this.circleFactory = props.circleFactory;
  }

  async handle(command: CircleRegisterCommand) {
    const ownerId = new UserId(command.getUserId());
    await this.userRepository.find(ownerId).catch((error: Error) => {
      if (error instanceof UserNotFoundException) {
        throw new UserNotFoundApplicationError(
          'user is not found for become circle owner',
          error
        );
      }
      throw new UnknownApplicationError('', error);
    });

    const newCircleName = new CircleName(command.getCircleName());
    if (!(await this.circleService.unique(newCircleName))) {
      throw new CircleDuplicateApplicationError(newCircleName);
    }
    const circle = await this.circleFactory.create(newCircleName, ownerId);
    await this.circleRepository.create(circle);
  }
}
