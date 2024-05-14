import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class ServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define DynamoDB table
    const userTable = new dynamodb.Table(this, "UserTable", {
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Define API Gateway
    const api = new apigateway.RestApi(this, "UserApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
    });

    const apiKey = new apigateway.ApiKey(this, "ApiKey");

    const usagePlan = new apigateway.UsagePlan(this, "UsagePlan", {
      name: "Usage Plan",
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    // Define Lambda functions
    const registerUserLambda = new lambda.Function(
      this,
      "RegisterUserFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "registerUser.handler",
        code: lambda.AssetCode.fromAsset("./lambda"),
        environment: {
          TABLE_NAME: userTable.tableName,
        },
      }
    );

    const getUserLambda = new lambda.Function(this, "GetUserFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "getUser.handler",
      code: lambda.AssetCode.fromAsset("./lambda"),
      environment: {
        TABLE_NAME: userTable.tableName,
      },
    });

    // Grant permissions to Lambda functions to access DynamoDB
    userTable.grantFullAccess(registerUserLambda);
    userTable.grantFullAccess(getUserLambda);

    // Define API resources and methods
    const users = api.root.addResource("users");
    const user = users.addResource("{id}");

    const usersIntegration = new apigateway.LambdaIntegration(
      registerUserLambda
    );
    const userIntegration = new apigateway.LambdaIntegration(getUserLambda);

    users.addMethod("POST", usersIntegration, {
      apiKeyRequired: true,
    });

    user.addMethod("GET", userIntegration, {
      apiKeyRequired: true,
    });

    new cdk.CfnOutput(this, "API Key ID", {
      value: apiKey.keyId,
    });
  }
}
