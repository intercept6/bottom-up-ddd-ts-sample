import { DeleteCircleServiceInterface } from './delete-circle-service-interface';
import { CircleRepositoryInterface } from '../../../domain/models/circles/circle-repository-interface';
import { DeleteCircleCommand } from './delete-circle-command';
import { CircleId } from '../../../domain/models/circles/circle-id';
import { Logger } from '../../../util/logger';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { UnknownApplicationError } from '../../errors/application-errors';

export class DeleteCircleService implements DeleteCircleServiceInterface {
  private readonly circleRepository: CircleRepositoryInterface;

  constructor(props: { circleRepository: CircleRepositoryInterface }) {
    this.circleRepository = props.circleRepository;
  }

  async handle(command: DeleteCircleCommand): Promise<void> {
    const circleId = new CircleId(command.getCircleId());
    const circle = await this.circleRepository
      .get(circleId)
      .catch((error: Error) => error);

    // 対象が見つからなかった場合も削除成功とする
    if (circle instanceof Error) {
      const error = circle;
      if (error instanceof CircleNotFoundRepositoryError) {
        Logger.debug(error);
        return;
      }
      throw new UnknownApplicationError(error);
    }

    await this.circleRepository.delete(circle).catch((error: Error) => {
      throw new UnknownApplicationError(error);
    });
  }
}
