import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';
import { CircleNotFoundError } from '#/repository/error/error';
import { CircleName } from '#/domain/circle/circleName';
import { UnknownApplicationError } from '#/application/error/error';

export class CircleService {
  constructor(private readonly circleRepository: CircleRepositoryInterface) {}

  async unique(circleName: CircleName): Promise<boolean> {
    const response = await this.circleRepository
      .find(circleName)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;
      if (error instanceof CircleNotFoundError) {
        return true;
      }
      throw new UnknownApplicationError(
        'Failed to check duplicate user name',
        error
      );
    }

    return false;
  }
}
