// import { Credentials, DynamoDB } from 'aws-sdk';
//
// const region = 'local';
// const sdkParams = {
//   apiVersion: '2012-08-10',
//   region,
//   endpoint: 'http://localhost:8000',
//   credentials: new Credentials({
//     secretAccessKey: 'dummy',
//     accessKeyId: 'dummy',
//   }),
// };
// const ddb = new DynamoDB(sdkParams);
// const documentClient = new DynamoDB.DocumentClient(sdkParams);
//
// export const createDynamoDBTable = async (tableName: string) => {
//   await ddb
//     .createTable({
//       TableName: tableName,
//       KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
//       BillingMode: 'PAY_PER_REQUEST',
//       AttributeDefinitions: [
//         { AttributeName: 'pk', AttributeType: 'S' },
//         { AttributeName: 'gsi1pk', AttributeType: 'S' },
//         { AttributeName: 'gsi2pk', AttributeType: 'S' },
//       ],
//       GlobalSecondaryIndexes: [
//         {
//           IndexName: 'gsi1',
//           KeySchema: [{ AttributeName: 'gsi1pk', KeyType: 'HASH' }],
//           Projection: { ProjectionType: 'ALL' },
//         },
//         {
//           IndexName: 'gsi2',
//           KeySchema: [{ AttributeName: 'gsi2pk', KeyType: 'HASH' }],
//           Projection: { ProjectionType: 'ALL' },
//         },
//       ],
//     })
//     .promise();
// };
//
// export const deleteDynamoDBTable = async (tableName: string) => {
//   await ddb.deleteTable({ TableName: tableName }).promise();
// };
//
// export const createUser = async (
//   tableName: string,
//   {
//     userId,
//     userName,
//     mailAddress,
//   }: {
//     readonly userId: string;
//     readonly userName: string;
//     readonly mailAddress: string;
//   }
// ) => {
//   await documentClient
//     .put({
//       TableName: tableName,
//       Item: {
//         pk: userId,
//         gsi1pk: userName,
//         gsi2pk: mailAddress,
//       },
//     })
//     .promise();
// };
