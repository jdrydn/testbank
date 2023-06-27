import path from 'path';
import * as cdk from 'aws-cdk-lib';

export function createTestbankApi(stack: cdk.Stack, role: cdk.aws_iam.Role) {
  const config = stack.stackName.endsWith('-prod') ? {
    NODE_ENV: 'production',
  } : {
    NODE_ENV: 'development',
  };

  const lambdaBundling: cdk.aws_lambda_nodejs.BundlingOptions = {
    minify: true,
    sourceMap: true,
    define: {
      'process.env.NODE_ENV': JSON.stringify(config.NODE_ENV),
    },
    externalModules: [
      'aws-sdk',
    ],
  };

  const apiFunction = new cdk.aws_lambda_nodejs.NodejsFunction(stack, 'api-function', {
    functionName: `${stack.stackName}-api`,
    runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
    entry: path.resolve(__dirname, './api.ts'),
    handler: 'handler',
    role: role as cdk.aws_iam.IRole,
    // logRetention: cdk.aws_logs.RetentionDays.ONE_MONTH,
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

  apiFunction.addPermission('PermitAPIGatewayInvocation', {
    principal: new cdk.aws_iam.ServicePrincipal('apigateway.amazonaws.com') as cdk.aws_iam.IPrincipal,
    sourceArn: `arn:aws:execute-api:${stack.region}:${stack.account}:${apiGateway.ref}/*/$default`,
  });

  return {
    apiFunction,
    apiGateway,
  };
}
