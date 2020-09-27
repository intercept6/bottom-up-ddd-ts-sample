import { CircleFactoryInterface } from '../../domain/models/circle/circleFactoryInterface';
import { Circle } from '../../domain/models/circle/circle';
import { CircleId } from '../../domain/models/circle/circleId';
import { CircleName } from '../../domain/models/circle/circleName';
import { UserId } from '../../domain/models/user/userId';
import {
  ArgumentRepositoryError,
  CircleNotFoundRepositoryError,
} from '../error/error';
import { generateUuid } from '../../util/uuid';
import { clone, store } from './inMemoryCircleRepository';

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
      throw new CircleNotFoundRepositoryError(arg1);
    } else if (arg1 instanceof CircleName && arg2 instanceof UserId) {
      // 実実装ではownerが実在するかチェックする
      return Circle.create(new CircleId(generateUuid()), arg1, arg2, []);
    }
    throw new ArgumentRepositoryError(
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
