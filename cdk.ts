import assert from 'assert';
import * as cdk from 'aws-cdk-lib';

const config: Record<'prod' | 'dev', {
  NODE_ENV: 'production' | 'development',
}> = {
  prod: {
    NODE_ENV: 'production',
  },
  dev: {
    NODE_ENV: 'development',
  },
};

(async () => {
  const app = new cdk.App();
  const stage: 'prod' | 'dev' | undefined = app.node.tryGetContext('stage');
  assert(stage, 'Missing stage from context');
  assert(config[stage], `Unknown stage: ${stage}`);

  const stack = new cdk.Stack(app, `testbank-${stage}`);

  const lambdaBundling: cdk.aws_lambda_nodejs.BundlingOptions = {
    minify: true,
    sourceMap: true,
    define: {
      'process.env.NODE_ENV': JSON.stringify(config[stage].NODE_ENV),
    },
    externalModules: [
      'aws-sdk',
    ],
  };

  const role = new cdk.aws_iam.Role(stack, 'role', {
    roleName: stack.stackName,
    assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com') as cdk.aws_iam.IPrincipal,
    managedPolicies: [
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    ],
  });

  const apiFunction = new cdk.aws_lambda_nodejs.NodejsFunction(stack, 'api-function', {
    functionName: `${stack.stackName}-api`,
    runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
    entry: './services/testbank-api/api.ts',
    handler: 'handler',
    role: role as cdk.aws_iam.IRole,
    timeout: cdk.Duration.seconds(30),
    bundling: lambdaBundling,
  });

  const apiGateway = new cdk.aws_apigatewayv2.CfnApi(stack, 'api-gateway', {
    name: stack.stackName,
    protocolType: 'HTTP',
    disableExecuteApiEndpoint: false,
    routeKey: '$default',
    target: apiFunction.functionArn,
  });

  return {
    app,
    stage,
    config: config[stage],
    stack,
    apiGateway,
  };
})();
