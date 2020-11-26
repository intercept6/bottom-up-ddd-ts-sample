#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BackendStack } from '../lib/backend-stack';

export const getEnvironmentVariable = (key: string) => {
  const value = process.env[key];
  if (value == null || value === '') {
    throw new Error(`Environment Variable ${key} is null or empty`);
  }
  return value;
};

const region = getEnvironmentVariable('AWS_REGION');
const account = getEnvironmentVariable('AWS_ACCOUNT');

const app = new cdk.App();
new BackendStack(app, 'Backend', { env: { account, region } });
