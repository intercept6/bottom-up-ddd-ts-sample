import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import {
  HttpApi,
  HttpMethod,
  LambdaProxyIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import { Code, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { FunctionUtils } from './handler-function';

const layerDir = './bundle/layer';
const srcDir = '../backend/src';

export class AwsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'MainTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
    });
    table.addGlobalSecondaryIndex({
      indexName: 'gsi1',
      partitionKey: {
        name: 'gsi1pk',
        type: AttributeType.STRING,
      },
    });
    table.addGlobalSecondaryIndex({
      indexName: 'gsi2',
      partitionKey: {
        name: 'gsi2pk',
        type: AttributeType.STRING,
      },
    });

    // HttpApi
    const httpApi = new HttpApi(this, 'HttpApi');

    const modules = new LayerVersion(this, 'ModulesLayer', {
      code: Code.fromAsset(layerDir),
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      description: 'Node.js modules layer for bottom up ddd',
    });

    const functionUtils = new FunctionUtils({
      scope: this,
      layers: [modules],
      fnProps: {
        environment: {
          MAIN_TABLE_NAME: table.tableName,
          MAIL_TABLE_GSI1_NAME: 'gsi1',
          MAIL_TABLE_GSI2_NAME: 'gsi2',
          ROOT_URI: httpApi.url ?? '',
        },
        timeout: Duration.seconds(10),
      },
    });

    // User
    // Create
    const registerUserFn = functionUtils.createFunction({
      id: 'RegisterUser',
      props: {
        code: Code.fromAsset(srcDir),
        handler:
          'awsServerless/controllers/user/register/userRegisterController.handle',
      },
    });
    httpApi.addRoutes({
      path: '/users',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: registerUserFn }),
    });
    table.grantReadWriteData(registerUserFn);

    // Read
    const getUserFn = functionUtils.createFunction({
      id: 'GetUser',
      props: {
        code: Code.fromAsset(srcDir),
        handler: 'awsServerless/controllers/user/get/userGetController.handle',
      },
    });
    httpApi.addRoutes({
      path: '/users/{userId}',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getUserFn }),
    });
    table.grantReadWriteData(getUserFn);

    // Update
    const updateUserFn = functionUtils.createFunction({
      id: 'UpdateUser',
      props: {
        code: Code.fromAsset(srcDir),
        handler:
          'awsServerless/controllers/user/update/userUpdateController.handle',
      },
    });
    httpApi.addRoutes({
      path: '/users/{userId}',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: updateUserFn }),
    });
    table.grantReadWriteData(updateUserFn);

    // Delete
    const deleteUserFn = functionUtils.createFunction({
      id: 'DeleteUser',
      props: {
        code: Code.fromAsset(srcDir),
        handler:
          'awsServerless/controllers/user/delete/userDeleteController.handle',
      },
    });
    httpApi.addRoutes({
      path: '/users/{userId}',
      methods: [HttpMethod.DELETE],
      integration: new LambdaProxyIntegration({ handler: deleteUserFn }),
    });
    table.grantReadWriteData(deleteUserFn);

    // Circle
    // Create
    const registerCircleFn = functionUtils.createFunction({
      id: 'RegisterCircle',
      props: {
        code: Code.fromAsset(srcDir),
        handler:
          'awsServerless/controllers/circle/register/circleRegisterController.handle',
      },
    });
    httpApi.addRoutes({
      path: '/circles',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: registerCircleFn }),
    });
    table.grantReadWriteData(registerCircleFn);

    // Read
    const getCircleFn = functionUtils.createFunction({
      id: 'GetCircle',
      props: {
        code: Code.fromAsset(srcDir),
        handler:
          'awsServerless/controllers/circle/get/circleGetController.handle',
      },
    });
    httpApi.addRoutes({
      path: '/circles/{circleId}',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getCircleFn }),
    });
    table.grantReadWriteData(getCircleFn);

    // Update
    const updateCircleFn = functionUtils.createFunction({
      id: 'UpdateCircle',
      props: {
        code: Code.fromAsset(srcDir),
        handler:
          'awsServerless/controllers/circle/update/circleUpdateController.handle',
      },
    });
    httpApi.addRoutes({
      path: '/circles/{circleId}',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: updateCircleFn }),
    });
    table.grantReadWriteData(updateCircleFn);

    // Delete
    const deleteCircleFn = functionUtils.createFunction({
      id: 'DeleteCircle',
      props: {
        code: Code.fromAsset(srcDir),
        handler:
          'awsServerless/controllers/circle/delete/circleDeleteController.handle',
      },
    });
    httpApi.addRoutes({
      path: '/circles/{circleId}',
      methods: [HttpMethod.DELETE],
      integration: new LambdaProxyIntegration({ handler: deleteCircleFn }),
    });
    table.grantReadWriteData(deleteCircleFn);
  }
}
