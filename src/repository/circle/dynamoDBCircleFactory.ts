import { CircleFactoryInterface } from '#/domain/circle/circleFactoryInterface';
import { Circle } from '#/domain/circle/circle';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { UserId } from '#/domain/models/user/userId';
import { ArgumentException } from '#/repository/error/error';
import { generateUuid } from '#/util/uuid';
import { DynamoDBUserRepository } from '#/repository/user/dynamodb/dynamoDBUserRepository';
import { DynamoDBCircleRepository } from '#/repository/circle/dynamoDBCircleRepository';

export class DynamoDBCircleFactory implements CircleFactoryInterface {
  // Factoryクラスは同一インフラストラクチャーのリポジトリを必ず使用する、なのでInterfacesではなくImplementsに依存させる
  private readonly userRepository: DynamoDBUserRepository;
  private readonly circleRepository: DynamoDBCircleRepository;

  constructor(props: {
    userRepository: DynamoDBUserRepository;
    circleRepository: DynamoDBCircleRepository;
  }) {
    this.userRepository = props.userRepository;
    this.circleRepository = props.circleRepository;
  }

  async create(circleId: CircleId): Promise<Circle>;
  async create(circleName: CircleName, owner: UserId): Promise<Circle>;
  async create(arg1: CircleId | CircleName, arg2?: UserId): Promise<Circle> {
    if (arg1 instanceof CircleId && arg2 == null) {
      return await this.circleRepository.find(arg1);
    } else if (arg1 instanceof CircleName && arg2 instanceof UserId) {
      await this.userRepository.find(arg2).catch((error: Error) => {
        throw error;
      });

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
}
