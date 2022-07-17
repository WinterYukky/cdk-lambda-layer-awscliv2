import { AssetHashType, DockerImage } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Props of AwsCliV2Layer.
 */
export interface AwsCliV2LayerProps extends lambda.LayerVersionOptions {
  /**
   * Specific version of AWS CLI.
   *
   * @default 'latest'
   */
  readonly awsCliVersion?: string;
}

/**
 * An AWS Lambda layer that includes the AWS CLI v2.
 */
export class AwsCliV2Layer extends lambda.LayerVersion {
  constructor(scope: Construct, id: string, props?: AwsCliV2LayerProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(__dirname, {
        assetHashType: AssetHashType.OUTPUT,
        exclude: ['*'],
        bundling: {
          image: DockerImage.fromRegistry(
            `amazon/aws-cli:${props?.awsCliVersion ?? 'latest'}`
          ),
          entrypoint: ['/bin/bash', '-c'],
          command: [
            'cp -rf /usr/local/aws-cli/v2/current/dist /asset-output/awscli',
          ],
        },
      }),
      description: '/opt/awscli/aws',
      ...props,
    });
  }
}
