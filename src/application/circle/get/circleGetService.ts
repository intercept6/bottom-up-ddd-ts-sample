import { CircleGetServiceInterface } from '#/application/circle/get/circleGetServiceInterface';
import { CircleGetCommand } from '#/application/circle/get/circleGetCommand';
import { CircleData } from '#/application/circle/circleData';
import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';
import { CircleId } from '#/domain/circle/circleId';

export class CircleGetService implements CircleGetServiceInterface {
  private readonly circleRepository: CircleRepositoryInterface;

  constructor(props: { circleRepository: CircleRepositoryInterface }) {
    this.circleRepository = props.circleRepository;
  }

  async handle(command: CircleGetCommand): Promise<CircleData> {
    const circleId = new CircleId(command.getCircleId());
    const circle = await this.circleRepository.get(circleId);

    return new CircleData(circle);
  }
}
