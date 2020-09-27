import { Stack, Construct, StackProps } from '@aws-cdk/core';

export class AwsStack extends Stack {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
  }
}
