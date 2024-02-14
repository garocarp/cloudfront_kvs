import { Stack, App, StackProps } from "aws-cdk-lib";
import { Runtime, Code, Function } from "aws-cdk-lib/aws-lambda";
import {
  PolicyStatement,
  Effect,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class MyLambdaStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create IAM role with administrator access
    const adminRole = new Role(this, "LambdaAdminRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    // Attach administrator access policy
    adminRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["*"], // Allow all actions
        resources: ["*"], // Allow access to all resources
      })
    );

    // Define Lambda function with specified role
    const lambdaFunction = new Function(this, "MyLambdaFunction", {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset(path.join(__dirname, "../resources/lambda")), // Path to your Lambda function code directory
      handler: "index.handler",
      role: adminRole,
    });
  }
}
