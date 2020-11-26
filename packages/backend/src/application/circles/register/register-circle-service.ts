import { CircleRepositoryInterface } from '../../../domain/models/circles/circle-repository-interface';
import { CircleService } from '../../../domain/models/services/circle-service';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { RegisterCircleCommand } from './register-circle-command';
import { UserId } from '../../../domain/models/users/user-id';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import {
  CircleDuplicateApplicationError,
  UnknownApplicationError,
  UserNotFoundApplicationError,
} from '../../errors/application-errors';
import { CircleName } from '../../../domain/models/circles/circle-name';
import { RegisterCircleServiceInterface } from './register-circle-service-interface';
import { CircleFactoryInterface } from '../../../domain/models/circles/circle-factory-interface';
import { CircleData } from '../circle-data';

export class RegisterCircleService implements RegisterCircleServiceInterface {
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

  async handle(command: RegisterCircleCommand): Promise<CircleData> {
    const ownerId = new UserId(command.getUserId());
    await this.userRepository.get(ownerId).catch((error: Error) => {
      if (error instanceof UserNotFoundRepositoryError) {
        throw new UserNotFoundApplicationError(ownerId, error);
      }
      throw new UnknownApplicationError(error);
    });

    const newCircleName = new CircleName(command.getCircleName());
    if (
      !(await this.circleService.unique(newCircleName).catch((error: Error) => {
        throw new UnknownApplicationError(error);
      }))
    ) {
      throw new CircleDuplicateApplicationError(newCircleName);
    }
    const circle = await this.circleFactory
      .create(newCircleName, ownerId)
      .catch((error: Error) => {
        throw new UnknownApplicationError(error);
      });
    await this.circleRepository.register(circle).catch((error: Error) => {
      throw new UnknownApplicationError(error);
    });

    return new CircleData(circle);
  }
}
