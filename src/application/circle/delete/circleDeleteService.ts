import { CircleDeleteServiceInterface } from '#/application/circle/delete/circleDeleteServiceInterface';
import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';
import { CircleDeleteCommand } from '#/application/circle/delete/circleDeleteCommand';
import { CircleId } from '#/domain/circle/circleId';
import { UnknownException } from '#/util/error';
import { systemLog } from '#/util/systemLog';
import { CircleNotFoundException } from '#/repository/error/error';

export class CircleDeleteService implements CircleDeleteServiceInterface {
  private readonly circleRepository: CircleRepositoryInterface;

  constructor(props: { circleRepository: CircleRepositoryInterface }) {
    this.circleRepository = props.circleRepository;
  }

  async handle(command: CircleDeleteCommand): Promise<void> {
    const circleId = new CircleId(command.getCircleId());
    const circle = await this.circleRepository
      .get(circleId)
      .catch((error: Error) => error);

    // 対象が見つからなかった場合も削除成功とする
    if (circle instanceof Error) {
      if (circle instanceof CircleNotFoundException) {
        systemLog('DEBUG', circle.message);
        return;
      }
      throw new UnknownException(circle);
    }

    await this.circleRepository.delete(circle);
  }
}