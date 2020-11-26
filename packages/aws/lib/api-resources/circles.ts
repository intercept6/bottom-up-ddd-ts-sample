import { Construct } from '@aws-cdk/core';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { Function } from '@aws-cdk/aws-lambda';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Table } from '@aws-cdk/aws-dynamodb';
import { CommonFunctionProps } from '../types';

export interface CirclesProps {
  commonFunctionProps: CommonFunctionProps;
  httpApi: HttpApi;
  table: Table;
}

export class Circles extends Construct {
  public readonly functions: { readonly [key: string]: Function };

  constructor(
    scope: Construct,
    id: string,
    { commonFunctionProps, httpApi, table }: CirclesProps
  ) {
    super(scope, id);

    const circlesRoot = 'controller/aws-lambda-with-apigateway-v2/circles';

    /**
     * Register
     */
    const registerCircle = new Function(scope, 'RegisterCircle', {
      ...commonFunctionProps,
      handler: `${circlesRoot}/register/register-circle-controller.handle`,
    });
    httpApi.addRoutes({
      path: '/circles',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: registerCircle }),
    });
    table.grantReadWriteData(registerCircle);

    /**
     * List
     */
    // const listCircle = new Function(scope, 'ListCircle', {
    //   ...commonFunctionProps,
    //   handler: `${circlesRoot}/list/list-circle-controller.handle`,
    // });
    // httpApi.addRoutes({
    //   path: '/circles',
    //   methods: [HttpMethod.GET],
    //   integration: new LambdaProxyIntegration({ handler: listCircle }),
    // });
    // table.grantReadWriteData(listCircle);

    /**
     * Get
     */
    const getCircle = new Function(scope, 'GetCircle', {
      ...commonFunctionProps,
      handler: `${circlesRoot}/get/get-circle-controller.handle`,
    });
    httpApi.addRoutes({
      path: '/circles/{circleId}',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getCircle }),
    });
    table.grantReadWriteData(getCircle);

    /**
     * Update
     */
    const updateCircle = new Function(scope, 'UpdateCircle', {
      ...commonFunctionProps,
      handler: `${circlesRoot}/update/update-circle-controller.handle`,
    });
    httpApi.addRoutes({
      path: '/circles/{circleId}',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: updateCircle }),
    });
    table.grantReadWriteData(updateCircle);

    /**
     * Delete
     */
    const deleteCircle = new Function(scope, 'DeleteCircle', {
      ...commonFunctionProps,
      handler: `${circlesRoot}/delete/delete-circle-controller.handle`,
    });
    httpApi.addRoutes({
      path: '/circles/{circleId}',
      methods: [HttpMethod.DELETE],
      integration: new LambdaProxyIntegration({ handler: deleteCircle }),
    });
    table.grantReadWriteData(deleteCircle);

    this.functions = {
      registerCircle,
      getCircle,
      // listCircle,
      updateCircle,
      deleteCircle,
    };
  }
}
