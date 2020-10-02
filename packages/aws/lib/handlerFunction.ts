import { Function, ILayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import { FunctionProps } from '@aws-cdk/aws-lambda/lib/function';

export class FunctionUtils {
  private readonly scope: Construct;
  private readonly fnProps: Partial<FunctionProps>;
  private readonly layers: ILayerVersion[] | undefined;

  constructor({
    scope,
    fnProps,
    layers,
  }: {
    readonly scope: Construct;
    readonly fnProps: Partial<FunctionProps>;
    readonly layers?: ILayerVersion[];
  }) {
    this.scope = scope;
    this.fnProps = fnProps;
    this.layers = layers;
  }

  createFunction({
    id,
    props,
  }: {
    id: string;
    props: Omit<FunctionProps, 'runtime'>;
  }): Function {
    return new Function(this.scope, id, {
      runtime: Runtime.NODEJS_12_X,
      layers: this.layers,
      ...this.fnProps,
      ...props,
    });
  }
}
