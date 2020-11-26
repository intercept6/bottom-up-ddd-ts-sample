import { Construct } from '@aws-cdk/core';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { Function } from '@aws-cdk/aws-lambda';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Table } from '@aws-cdk/aws-dynamodb';
import { CommonFunctionProps } from '../types';

export interface UsersProps {
  httpApi: HttpApi;
  table: Table;
  commonFunctionProps: CommonFunctionProps;
}

export class Users extends Construct {
  public readonly functions: { readonly [key: string]: Function };

  constructor(
    scope: Construct,
    id: string,
    { httpApi, table, commonFunctionProps }: UsersProps
  ) {
    super(scope, id);
    const usersRoot = 'controller/aws-lambda-with-apigateway-v2/users';

    /**
     * Register
     */
    const registerUser = new Function(scope, 'RegisterUser', {
      ...commonFunctionProps,
      handler: `${usersRoot}/register/register-user-controller.handle`,
    });
    httpApi.addRoutes({
      path: '/users',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: registerUser }),
    });
    table.grantReadWriteData(registerUser);

    /**
     * List
     */
    const listUser = new Function(scope, 'ListUser', {
      ...commonFunctionProps,
      handler: `${usersRoot}/list/list-user-controller.handle`,
    });
    httpApi.addRoutes({
      path: '/users',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: listUser }),
    });
    table.grantReadWriteData(listUser);

    /**
     * Get
     */
    const getUser = new Function(scope, 'GetUser', {
      ...commonFunctionProps,
      handler: `${usersRoot}/get/get-user-controller.handle`,
    });
    httpApi.addRoutes({
      path: '/users/{userId}',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getUser }),
    });
    table.grantReadWriteData(getUser);

    /**
     * Update
     */
    const updateUser = new Function(scope, 'UpdateUser', {
      ...commonFunctionProps,
      handler: `${usersRoot}/update/update-user-controller.handle`,
    });
    httpApi.addRoutes({
      path: '/users/{userId}',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: updateUser }),
    });
    table.grantReadWriteData(updateUser);

    /**
     * Delete
     */
    const deleteUser = new Function(scope, 'DeleteUser', {
      ...commonFunctionProps,
      handler: `${usersRoot}/delete/delete-user-controller.handle`,
    });
    httpApi.addRoutes({
      path: '/users/{userId}',
      methods: [HttpMethod.DELETE],
      integration: new LambdaProxyIntegration({ handler: deleteUser }),
    });
    table.grantReadWriteData(deleteUser);

    this.functions = {
      registerUser,
      getUser,
      listUser,
      updateUser,
      deleteUser,
    };
  }
}
