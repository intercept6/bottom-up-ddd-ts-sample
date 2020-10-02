import { CircleGetServiceInterface } from './circleGetServiceInterface';
import { CircleGetCommand } from './circleGetCommand';
import { CircleData } from '../circleData';
import { CircleRepositoryInterface } from '../../../domain/models/circles/circleRepositoryInterface';
import { CircleId } from '../../../domain/models/circles/circleId';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repositoryErrors';
import { CircleNotFoundApplicationError } from '../../error/error';
import { UnknownError } from '../../../util/error';

export class CircleGetService implements CircleGetServiceInterface {
  private readonly circleRepository: CircleRepositoryInterface;

  constructor(props: { circleRepository: CircleRepositoryInterface }) {
    this.circleRepository = props.circleRepository;
  }

  async handle(command: CircleGetCommand): Promise<CircleData> {
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
