import { CircleFactoryInterface } from '../../../domain/models/circles/circle-factory-interface';
import { Circle } from '../../../domain/models/circles/circle';
import { CircleId } from '../../../domain/models/circles/circle-id';
import { CircleName } from '../../../domain/models/circles/circle-name';
import { UserId } from '../../../domain/models/users/user-id';
import { ArgumentRepositoryError } from '../../errors/repository-errors';
import { generateUuid } from '../../../util/uuid';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { CircleRepositoryInterface } from '../../../domain/models/circles/circle-repository-interface';

export class DynamodbCircleFactory implements CircleFactoryInterface {
  private readonly userRepository: UserRepositoryInterface;
  private readonly circleRepository: CircleRepositoryInterface;

  constructor(props: {
    userRepository: UserRepositoryInterface;
    circleRepository: CircleRepositoryInterface;
  }) {
    this.userRepository = props.userRepository;
    this.circleRepository = props.circleRepository;
  }

  async create(arg1: CircleId | CircleName, arg2?: UserId): Promise<Circle> {
    if (arg1 instanceof CircleId && arg2 == null) {
      return await this.circleRepository.get(arg1);
    } else if (arg1 instanceof CircleName && arg2 instanceof UserId) {
      await this.userRepository.get(arg2).catch((error: Error) => {
        throw error;
      });

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
}
