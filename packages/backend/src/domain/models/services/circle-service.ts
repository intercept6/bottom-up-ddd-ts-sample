import { CircleRepositoryInterface } from '../circles/circle-repository-interface';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { CircleName } from '../circles/circle-name';
import { UnknownDomainError } from '../../errors/domain-errors';

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
      throw new UnknownDomainError(error);
    }

    return false;
  }
}
