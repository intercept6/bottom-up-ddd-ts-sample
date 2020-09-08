import { CircleJoinServiceInterface } from '#/application/circle/join/circleJoinServiceInterface';
import { CircleJoinCommand } from '#/application/circle/join/circleJoinCommand';
import { UserId } from '#/domain/models/user/userId';
import { UserRepositoryInterface } from '#/domain/models/user/userRepositoryInterface';
import { CircleId } from '#/domain/circle/circleId';
import { CircleRepositoryInterface } from '#/repository/circle/circleRepositoryInterface';

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
    const memberId = new UserId(command.getUserId());
    const member = await this.userRepository
      .find(memberId)
      .catch((error: Error) => error);
    if (member instanceof Error) {
      throw member;
    }

    const circleId = new CircleId(command.getCircleId());
    const circle = await this.circleRepository
      .find(circleId)
      .catch((error: Error) => error);
    if (circle instanceof Error) {
      throw circle;
    }

    circle.join(member);
    await this.circleRepository.update(circle);
  }
}
