import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const generateAPIGatewayProxyEventV2 = (): APIGatewayProxyEventV2 => ({
  version: 'test string',
  routeKey: 'test string',
  rawPath: 'test string',
  rawQueryString: 'test string',
  headers: {},
  isBase64Encoded: false,
  requestContext: {
    accountId: 'test string',
    apiId: 'test string',
    domainName: 'test string',
    domainPrefix: 'test string',
    http: {
      method: 'test string',
      path: 'test string',
      protocol: 'test string',
      sourceIp: 'test string',
      userAgent: 'test string',
    },
    requestId: 'test string',
    routeKey: 'test string',
    stage: 'test string',
    time: 'test string',
    timeEpoch: 0,
  },
});
