import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamodb = new DynamoDB({});

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    // Extract GUID from the query parameters
    const id = event.pathParameters?.id;

    // Check if GUID is present in the query parameters
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "GUID parameter is missing" }),
      };
    }

    const result = await dynamodb.send(
      new GetCommand({
        TableName: "UserTable",
        Key: {
          userId: id,
        },
      })
    );

    // Check if user exists in DynamoDB
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    // Return user information
    return {
      statusCode: 200,
      body: JSON.stringify({ user: result.Item }),
    };
  } catch (error) {
    console.error("Error retrieving user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
}
