import { CircleRepositoryInterface } from '../circles/circle-repository-interface';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { CircleName } from '../circles/circle-name';
import { UnknownError } from '../../../util/error';

export class CircleService {
  constructor(private readonly circleRepository: CircleRepositoryInterface) {}

  async unique(circleName: CircleName): Promise<boolean> {
    const response = await this.circleRepository
      .get(circleName)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;
      if (error instanceof CircleNotFoundRepositoryError) {
        return true;
      }
      throw new UnknownError('Failed to check duplicate user name', error);
    }

    return false;
  }
}
