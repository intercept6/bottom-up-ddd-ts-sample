import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Code, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { FunctionUtils } from './handler-function';
import { resolve } from 'path';

const rootDir = resolve(__dirname, '..', '..', 'backend');

export class BackendStack extends Stack {
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
    const httpApi = new HttpApi(this, 'HttpApi', {
      apiName: 'bottom-up-ddd',
    });

    const modules = new LayerVersion(this, 'ModulesLayer', {
      code: Code.fromAsset(rootDir, {
        bundling: {
          image: Runtime.NODEJS_12_X.bundlingDockerImage,
          command: [
            'bash',
            '-c',
            [
              'npm install -g yarn',
              'mkdir -p /asset-output/nodejs/',
              'cp package.json yarn.lock /asset-output/nodejs/',
              'yarn install --production --cwd /asset-output/nodejs/',
            ].join(' && '),
          ],
          user: 'root',
        },
      }),
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      description: 'Node.js modules layer for bottom up ddd',
    });

    const functionUtils = new FunctionUtils({
      scope: this,
      layers: [modules],
      fnProps: {
        environment: {
          MAIN_TABLE_NAME: table.tableName,
          MAIN_TABLE_GSI1_NAME: 'gsi1',
          MAIN_TABLE_GSI2_NAME: 'gsi2',
          MAIN_TABLE_GSI3_NAME: 'gsi3',
          ROOT_URI: httpApi.url!,
        },
        timeout: Duration.seconds(10),
      },
    });

    const code = Code.fromAsset(rootDir, {
      bundling: {
        image: Runtime.NODEJS_12_X.bundlingDockerImage,
        command: [
          'bash',
          '-c',
          [
            'cp -au . /tmp',
            'cd /tmp',
            'npm install -g yarn',
            'yarn install',
            'yarn build --outDir /asset-output',
          ].join(' && '),
        ],
        user: 'root',
      },
    });

    // User
    // Create
    const registerUserFn = functionUtils.createFunction({
      id: 'RegisterUser',
      props: {
        code: code,
        handler:
          'controller/aws-lambda-with-apigateway-v2/users/register/user-register-controller.handle',
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
        code: code,
        handler:
          'controller/aws-lambda-with-apigateway-v2/users/get/user-get-controller.handle',
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
        code: code,
        handler:
          'controller/aws-lambda-with-apigateway-v2/users/update/user-update-controller.handle',
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
        code: code,
        handler:
          'controller/aws-lambda-with-apigateway-v2/users/delete/user-delete-controller.handle',
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
        code: code,
        handler:
          'controller/aws-lambda-with-apigateway-v2/circles/register/circle-register-controller.handle',
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
        code: code,
        handler:
          'controller/aws-lambda-with-apigateway-v2/circles/get/circle-get-controller.handle',
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
        code: code,
        handler:
          'controller/aws-lambda-with-apigateway-v2/circles/update/circle-update-controller.handle',
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
        code: code,
        handler:
          'controller/aws-lambda-with-apigateway-v2/circles/delete/circle-delete-controller.handle',
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
