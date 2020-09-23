import { CircleUpdateServiceInterface } from '#/application/circle/update/circleUpdateServiceInterface';
import { CircleUpdateCommand } from '#/application/circle/update/circleUpdateCommand';
import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { CircleService } from '#/domain/models/services/circleService';
import { CircleDuplicateApplicationError } from '#/application/error/error';
import { UserId } from '#/domain/models/user/userId';
import { UserRepositoryInterface } from '#/domain/models/user/userRepositoryInterface';

export class CircleUpdateService implements CircleUpdateServiceInterface {
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

  async handle(command: CircleUpdateCommand): Promise<void> {
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
      await this.userRepository.get(newOwnerId);
      circle.changeOwnerId(newOwnerId);
    }

    const memberIds = command.getMemberIds();
    if (memberIds != null) {
      const newMemberIds = memberIds.map((value) => new UserId(value));
      await this.userRepository.batchGet(newMemberIds);
      circle.join(newMemberIds);
    }

    await this.circleRepository.update(circle);
  }
}
