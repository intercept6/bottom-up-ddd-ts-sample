import { CircleRepositoryInterface } from '../../../domain/models/circle/circleRepositoryInterface';
import { CircleService } from '../../../domain/models/services/circleService';
import { UserRepositoryInterface } from '../../../domain/models/user/userRepositoryInterface';
import { CircleRegisterCommand } from './circleRegisterCommand';
import { UserId } from '../../../domain/models/user/userId';
import { UserNotFoundRepositoryError } from '../../../repository/error/error';
import {
  CircleDuplicateApplicationError,
  UserNotFoundApplicationError,
} from '../../error/error';
import { CircleName } from '../../../domain/models/circle/circleName';
import { CircleRegisterServiceInterface } from './circleRegisterServiceInterface';
import { CircleFactoryInterface } from '../../../domain/models/circle/circleFactoryInterface';
import { UnknownError } from '../../../util/error';
import { CircleData } from '../circleData';

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
