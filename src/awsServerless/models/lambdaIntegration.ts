export type apiGWEvent = {
  version: '2.0';
  cookies: string[];
  headers: {
    [key: string]: string;
  };
  queryStringParameters: { [key: string]: string };
  requestContext: {
    accountId: string;
    apiId: string;
    authorizer: {
      jwt: {
        claims: { [key: string]: string };
      };
      scopes: string[];
    };
  };
  http: {
    method: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH';
    path: string;
    protocol: string;
    sourceIp: string;
    userAgent: string;
  };
  requestId: string;
  body: string;
  pathParameters: { [key: string]: string | undefined };
  isBase64Encoded: boolean;
  stageVariables: { [key: string]: string };
};

export type apiGWResponse = {
  cookies?: string[];
  isBase64Encoded?: boolean;
  statusCode: number;
  headers?: { [key: string]: string };
  body?: string;
};

export type LambdaHandler = (event: apiGWEvent) => Promise<apiGWResponse>;
