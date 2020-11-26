import {
  CfnOutput,
  Construct,
  Duration,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2';
import { Code, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { resolve } from 'path';
import { Users } from './api-resources/users';
import { Circles } from './api-resources/circles';
import { CommonFunctionProps } from './types';

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
    ['gsi1', 'gsi2', 'gsi3'].map((name) => {
      table.addGlobalSecondaryIndex({
        indexName: name,
        partitionKey: {
          name: `${name}pk`,
          type: AttributeType.STRING,
        },
      });
    });

    new CfnOutput(this, 'TableName', {
      value: table.tableName!,
      description: 'Table Name',
    });

    const httpApi = new HttpApi(this, 'HttpApi', {
      apiName: 'bottom-up-ddd',
    });

    new CfnOutput(this, 'ApiUrl', {
      value: httpApi.url!,
      description: 'API URL',
    });

    const layers = new LayerVersion(this, 'ModulesLayer', {
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

    const commonFunctionProps: CommonFunctionProps = {
      runtime: Runtime.NODEJS_12_X,
      layers: [layers],
      code,
      environment: {
        MAIN_TABLE_NAME: table.tableName,
        MAIN_TABLE_GSI1_NAME: 'gsi1',
        MAIN_TABLE_GSI2_NAME: 'gsi2',
        MAIN_TABLE_GSI3_NAME: 'gsi3',
        ROOT_URI: httpApi.url!,
      },
      timeout: Duration.seconds(10),
    };
    new Users(this, 'Users', { commonFunctionProps, table, httpApi });
    new Circles(this, 'Circles', { commonFunctionProps, table, httpApi });
  }
}
