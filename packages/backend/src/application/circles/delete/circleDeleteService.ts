import { CircleDeleteServiceInterface } from './circleDeleteServiceInterface';
import { CircleRepositoryInterface } from '../../../domain/models/circles/circleRepositoryInterface';
import { CircleDeleteCommand } from './circleDeleteCommand';
import { CircleId } from '../../../domain/models/circles/circleId';
import { Logger } from '../../../util/logger';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repositoryErrors';
import { UnknownError } from '../../../util/error';

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
      if (circle instanceof CircleNotFoundRepositoryError) {
        Logger.debug(circle);
        return;
      }
      throw new UnknownError('unknown error', circle);
    }

    await this.circleRepository.delete(circle);
  }
}
