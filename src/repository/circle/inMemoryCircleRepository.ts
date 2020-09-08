import { Circle } from '#/domain/circle/circle';
import { CircleRepositoryInterface } from '#/repository/circle/circleRepositoryInterface';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { UserId } from '#/domain/models/user/userId';
import { CircleNotFoundError } from '#/repository/error/error';

export class InMemoryCircleRepository implements CircleRepositoryInterface {
  public readonly store: Circle[];

  constructor() {
    this.store = [];
  }

  save(circle: Circle) {
    const index = this.store.findIndex((value) =>
      value.getCircleId().equals(circle.getCircleId())
    );

    const exist = index !== -1;
    if (exist) {
      this.store.splice(index, 1, this.clone(circle));
    } else {
      this.store.push(this.clone(circle));
    }
  }

  async create(circle: Circle): Promise<void> {
    return this.save(circle);
  }

  async update(circle: Circle): Promise<void> {
    return this.save(circle);
  }

  async find(identity: CircleId | CircleName): Promise<Circle> {
    if (identity instanceof CircleId) {
      const target = this.store.find((value) =>
        value.getCircleId().equals(identity)
      );

      if (target != null) {
        return this.clone(target);
      }
      throw new CircleNotFoundError(identity);
    } else {
      const target = this.store.find((value) =>
        value.getCircleName().equals(identity)
      );

      if (target != null) {
        return this.clone(target);
      }
      throw new CircleNotFoundError(identity);
    }
  }

  clone(circle: Circle) {
    return new Circle(
      new CircleId(circle.getCircleId().getValue()),
      new CircleName(circle.getCircleName().getValue()),
      new UserId(circle.getOwner().getValue()),
      [...circle.getMembers()]
    );
  }
}
