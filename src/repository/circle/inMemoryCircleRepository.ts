import { Circle } from '#/domain/circle/circle';
import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { UserId } from '#/domain/models/user/userId';
import { CircleNotFoundRepositoryError } from '#/repository/error/error';

export const store: Circle[] = [];

export const clone = (circle: Circle) => {
  return Circle.create(
    new CircleId(circle.getCircleId().getValue()),
    new CircleName(circle.getCircleName().getValue()),
    new UserId(circle.getOwnerId().getValue()),
    [...circle.getMemberIds()]
  );
};

export class InMemoryCircleRepository implements CircleRepositoryInterface {
  public store: Circle[];

  constructor() {
    this.store = store;
  }

  save(circle: Circle) {
    const index = this.store.findIndex((value) =>
      value.getCircleId().equals(circle.getCircleId())
    );

    const exist = index !== -1;
    if (exist) {
      this.store.splice(index, 1, clone(circle));
    } else {
      this.store.push(clone(circle));
    }
  }

  async create(circle: Circle): Promise<void> {
    return this.save(circle);
  }

  async update(circle: Circle): Promise<void> {
    return this.save(circle);
  }

  async get(identity: CircleId | CircleName): Promise<Circle> {
    if (identity instanceof CircleId) {
      const target = this.store.find((value) =>
        value.getCircleId().equals(identity)
      );

      if (target != null) {
        return clone(target);
      }
      throw new CircleNotFoundRepositoryError(identity);
    } else {
      const target = this.store.find((value) =>
        value.getCircleName().equals(identity)
      );

      if (target != null) {
        return clone(target);
      }
      throw new CircleNotFoundRepositoryError(identity);
    }
  }

  async delete(circle: Circle): Promise<void> {
    const index = this.store.findIndex((value) => value.equals(circle));
    this.store.splice(index, 1);
  }

  clear() {
    this.store = [];
  }
}
