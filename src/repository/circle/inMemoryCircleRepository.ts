import { Circle } from '#/domain/circle/circle';
import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { UserId } from '#/domain/models/user/userId';
import {
  ArgumentException,
  CircleNotFoundException,
} from '#/repository/error/error';
import { CircleFactoryInterface } from '#/domain/circle/circleFactoryInterface';
import { generateUuid } from '#/util/uuid';

const store: Circle[] = [];

const clone = (circle: Circle) => {
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
      throw new CircleNotFoundException(identity);
    } else {
      const target = this.store.find((value) =>
        value.getCircleName().equals(identity)
      );

      if (target != null) {
        return clone(target);
      }
      throw new CircleNotFoundException(identity);
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

export class InMemoryCircleFactory implements CircleFactoryInterface {
  public store: Circle[];

  constructor() {
    this.store = store;
  }

  async create(circleId: CircleId): Promise<Circle>;
  async create(circleName: CircleName, owner: UserId): Promise<Circle>;
  async create(arg1: CircleId | CircleName, arg2?: UserId): Promise<Circle> {
    if (arg1 instanceof CircleId && arg2 == null) {
      const target = this.store.find((value) =>
        value.getCircleId().equals(arg1)
      );

      if (target != null) {
        return clone(target);
      }
      throw new CircleNotFoundException(arg1);
    } else if (arg1 instanceof CircleName && arg2 instanceof UserId) {
      // 実実装ではownerが実在するかチェックする
      return Circle.create(new CircleId(generateUuid()), arg1, arg2, []);
    }
    throw new ArgumentException(
      JSON.stringify({
        message: 'メソッドが意図せぬ引数で呼び出されました。',
        arg1: {
          type: typeof arg1,
          value: arg1,
        },
        arg2: {
          type: typeof arg2,
          value: arg2,
        },
      })
    );
  }

  clear() {
    this.store = [];
  }
}
