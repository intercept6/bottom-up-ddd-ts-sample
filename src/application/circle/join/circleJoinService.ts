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
    const memberId = new UserId(command.getUserId());
    await this.userRepository.find(memberId).catch((error: Error) => {
      throw error;
    });

    const circleId = new CircleId(command.getCircleId());
    const circle = await this.circleRepository
      .find(circleId)
      .catch((error: Error) => {
        throw error;
      });

    circle.join(memberId);
    await this.circleRepository.update(circle);
  }
}
