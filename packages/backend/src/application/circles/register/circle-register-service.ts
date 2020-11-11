import { CircleRepositoryInterface } from '../../../domain/models/circles/circle-repository-interface';
import { CircleService } from '../../../domain/models/services/circle-service';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { CircleRegisterCommand } from './circle-register-command';
import { UserId } from '../../../domain/models/users/user-id';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import {
  CircleDuplicateApplicationError,
  UserNotFoundApplicationError,
} from '../../errors/application-errors';
import { CircleName } from '../../../domain/models/circles/circle-name';
import { CircleRegisterServiceInterface } from './circle-register-service-interface';
import { CircleFactoryInterface } from '../../../domain/models/circles/circle-factory-interface';
import { UnknownError } from '../../../util/error';
import { CircleData } from '../circle-data';

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

  async handle(command: CircleRegisterCommand): Promise<CircleData> {
    const ownerId = new UserId(command.getUserId());
    await this.userRepository.get(ownerId).catch((error: Error) => {
      if (error instanceof UserNotFoundRepositoryError) {
        throw new UserNotFoundApplicationError(ownerId, error);
      }
      throw new UnknownError('owner user is not found', error);
    });

    const newCircleName = new CircleName(command.getCircleName());
    if (!(await this.circleService.unique(newCircleName))) {
      throw new CircleDuplicateApplicationError(newCircleName);
    }
    const circle = await this.circleFactory.create(newCircleName, ownerId);
    await this.circleRepository.create(circle);

    return new CircleData(circle);
  }
}
