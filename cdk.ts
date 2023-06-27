import assert from 'assert';
import * as cdk from 'aws-cdk-lib';

import { createTestbankApi } from './services/testbank-api/cdk';

(async () => {
  const app = new cdk.App();
  const stage: 'prod' | 'dev' | undefined = app.node.tryGetContext('stage');
  assert(stage, 'Missing stage from context');

  const stack = new cdk.Stack(app, `testbank-${stage}`);

  const lambdaRole = new cdk.aws_iam.Role(stack, 'role', {
    roleName: stack.stackName,
    assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com') as cdk.aws_iam.IPrincipal,
    managedPolicies: [
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    ],
  });

  lambdaRole.addToPolicy(new cdk.aws_iam.PolicyStatement({
    effect: cdk.aws_iam.Effect.ALLOW,
    actions: ['logs:PutRetentionPolicy', 'logs:DeleteRetentionPolicy'],
    resources: ['*'],
  }));

  createTestbankApi(stack, lambdaRole);
})();
