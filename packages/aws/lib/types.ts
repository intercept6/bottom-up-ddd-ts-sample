import { FunctionProps } from '@aws-cdk/aws-lambda';

export type CommonFunctionProps = Omit<FunctionProps, 'handler'>;
