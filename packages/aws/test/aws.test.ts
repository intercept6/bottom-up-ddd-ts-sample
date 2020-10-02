import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { AwsStack } from '../lib/awsStack';

test('Empty Stack', () => {
  const app = new App();
  // WHEN
  const stack = new AwsStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
