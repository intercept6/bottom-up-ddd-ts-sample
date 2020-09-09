import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';
import { Circle } from '#/domain/circle/circle';
import { CircleNotFoundError, UnknownError } from '#/repository/error/error';
import { CircleName } from '#/domain/circle/circleName';
import { UnknownApplicationError } from '#/application/error/error';

export class CircleService {
  constructor(private readonly circleRepository: CircleRepositoryInterface) {}

  async exists(circle: Circle) {
    const response = await this.circleRepository
      .find(circle.getCircleName())
      .catch((error: Error) => error);
    if (response instanceof Error) {
      const error = response;
      if (error instanceof CircleNotFoundError) {
        return false;
      }
      throw new UnknownError('circle found failed', error);
    }
    return true;
  }

  async unique(circleName: CircleName): Promise<boolean> {
    const response = await this.circleRepository
      .find(circleName)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;
      if (error instanceof CircleNotFoundError) {
        return false;
      }
      throw new UnknownApplicationError(
        'Failed to check duplicate user name',
        error
      );
    }

    return true;
  }
}
