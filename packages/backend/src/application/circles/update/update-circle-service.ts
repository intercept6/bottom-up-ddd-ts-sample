import { UpdateCircleServiceInterface } from './updateCircleServiceInterface';
import { UpdateCircleCommand } from './update-circle-command';
import { CircleRepositoryInterface } from '../../../domain/models/circles/circle-repository-interface';
import { CircleId } from '../../../domain/models/circles/circle-id';
import { CircleName } from '../../../domain/models/circles/circle-name';
import { CircleService } from '../../../domain/models/services/circle-service';
import {
  CircleDuplicateApplicationError,
  MembersNotFoundApplicationError,
  OwnerNotFoundApplicationError,
} from '../../errors/application-errors';
import { UserId } from '../../../domain/models/users/user-id';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { UnknownError } from '../../../util/error';

export class UpdateCircleService implements UpdateCircleServiceInterface {
  private readonly userRepository: UserRepositoryInterface;
  private readonly circleService: CircleService;
  private readonly circleRepository: CircleRepositoryInterface;

  constructor(props: {
    userRepository: UserRepositoryInterface;
    circleRepository: CircleRepositoryInterface;
  }) {
    this.userRepository = props.userRepository;
    this.circleRepository = props.circleRepository;
    this.circleService = new CircleService(props.circleRepository);
  }

  async handle(command: UpdateCircleCommand): Promise<void> {
    const circleId = new CircleId(command.getCircleId());
    const circle = await this.circleRepository.get(circleId);

    const circleName = command.getCircleName();
    if (circleName != null) {
      const newCircleName = new CircleName(circleName);
      circle.changeCircleName(newCircleName);
      if (!(await this.circleService.unique(newCircleName))) {
        throw new CircleDuplicateApplicationError(newCircleName);
      }
    }

    const ownerId = command.getOwnerId();
    if (ownerId != null) {
      const newOwnerId = new UserId(ownerId);
      await this.userRepository.get(newOwnerId).catch((error: Error) => {
        if (error instanceof UserNotFoundRepositoryError) {
          throw new OwnerNotFoundApplicationError(newOwnerId, error);
        }
        throw new UnknownError('unknown error', error);
      });
      circle.changeOwnerId(newOwnerId);
    }

    const memberIds = command.getMemberIds();
    if (memberIds != null) {
      const newMemberIds = memberIds.map((value) => new UserId(value));
      await this.userRepository.batchGet(newMemberIds).catch((error: Error) => {
        if (error instanceof UserNotFoundRepositoryError) {
          throw new MembersNotFoundApplicationError(newMemberIds, error);
        }
        throw new UnknownError('unknown error', error);
      });
      circle.joinMembers(newMemberIds);
    }

    await this.circleRepository.update(circle).catch((error: Error) => error);
  }
}
