#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsStack } from '../lib/aws-stack';

const region = process.env.AWS_REGION ?? 'ap-northeast-1';
const account = process.env.AWS_ACCOUNT;

const app = new cdk.App();
// eslint-disable-next-line no-new
new AwsStack(app, 'AwsStack', { env: { account, region } });
