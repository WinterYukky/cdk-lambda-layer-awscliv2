import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cr from 'aws-cdk-lib/custom-resources';

import { AwsCliV2Layer } from '../src';

/**
 * Test verifies that AWS CLI is invoked successfully inside Lambda runtime.
 */

const app = new cdk.App();

const stack = new cdk.Stack(app, 'lambda-layer-awscli-integ-stack');
const bootstrap = new lambda.LayerVersion(stack, 'Bootstrap', {
  code: lambda.Code.fromAsset(path.join(__dirname, 'runtime')),
});
const layer = new AwsCliV2Layer(stack, 'AwsCliV2Layer');
const runtimes = [lambda.Runtime.PROVIDED, lambda.Runtime.PROVIDED_AL2];

for (const runtime of runtimes) {
  const provider = new cr.Provider(stack, `Provider${runtime.name}`, {
    onEventHandler: new lambda.Function(stack, `Lambda$${runtime.name}`, {
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-handler')),
      handler: 'index.handler',
      runtime: runtime,
      layers: [bootstrap, layer],
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
    }),
  });

  const awsCLIV2Resource = new cdk.CustomResource(
    stack,
    `CustomResource${runtime.name}`,
    {
      serviceToken: provider.serviceToken,
    }
  );
  new cdk.CfnOutput(stack, `Version${runtime.name}`, {
    value: awsCLIV2Resource.getAttString('Version'),
  });
}

app.synth();
