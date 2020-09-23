import { CircleJoinServiceInterface } from '#/application/circle/join/circleJoinServiceInterface';
import { CircleJoinCommand } from '#/application/circle/join/circleJoinCommand';
import { UserId } from '#/domain/models/user/userId';
import { UserRepositoryInterface } from '#/domain/models/user/userRepositoryInterface';
import { CircleId } from '#/domain/circle/circleId';
import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';

export class CircleJoinService implements CircleJoinServiceInterface {
  private readonly userRepository: UserRepositoryInterface;
  private readonly circleRepository: CircleRepositoryInterface;

  constructor(props: {
    userRepository: UserRepositoryInterface;
    circleRepository: CircleRepositoryInterface;
  }) {
    this.userRepository = props.userRepository;
    this.circleRepository = props.circleRepository;
  }

  async handle(command: CircleJoinCommand): Promise<void> {
    const circleId = new CircleId(command.getCircleId());
    const circle = await this.circleRepository
      .get(circleId)
      .catch((error: Error) => {
        throw error;
      });

    const memberIds = command.getMemberIds().map((value) => new UserId(value));
    await this.userRepository.batchGet(memberIds);
    circle.join(memberIds);

    await this.circleRepository.update(circle);
  }
}
