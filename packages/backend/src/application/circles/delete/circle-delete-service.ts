import { CircleDeleteServiceInterface } from './circleDeleteServiceInterface';
import { CircleRepositoryInterface } from '../../../domain/models/circles/circle-repository-interface';
import { CircleDeleteCommand } from './circle-delete-command';
import { CircleId } from '../../../domain/models/circles/circle-id';
import { Logger } from '../../../util/logger';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
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