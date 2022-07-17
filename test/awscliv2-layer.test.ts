import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AwsCliV2Layer } from '../src';

test('synthesized to a v2 layer version', () => {
  //GIVEN
  const stack = new Stack();

  // WHEN
  new AwsCliV2Layer(stack, 'MyLayer');

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::Lambda::LayerVersion', {
    Description: '/opt/awscli/aws',
  });
});
