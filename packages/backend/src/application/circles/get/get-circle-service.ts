import { GetCircleServiceInterface } from './get-circle-service-interface';
import { GetCircleCommand } from './get-circle-command';
import { CircleData } from '../circle-data';
import { CircleRepositoryInterface } from '../../../domain/models/circles/circle-repository-interface';
import { CircleId } from '../../../domain/models/circles/circle-id';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { CircleNotFoundApplicationError } from '../../errors/application-errors';
import { UnknownError } from '../../../util/error';

export class GetCircleService implements GetCircleServiceInterface {
  private readonly circleRepository: CircleRepositoryInterface;

  constructor(props: { circleRepository: CircleRepositoryInterface }) {
    this.circleRepository = props.circleRepository;
  }

  async handle(command: GetCircleCommand): Promise<CircleData> {
    const circleId = new CircleId(command.getCircleId());
    const response = await this.circleRepository
      .get(circleId)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;
      if (error instanceof CircleNotFoundRepositoryError) {
        throw new CircleNotFoundApplicationError(circleId, error);
      }
      throw new UnknownError('unknown error', error);
    }

    return new CircleData(response);
  }
}
