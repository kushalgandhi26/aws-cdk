import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

// Create a DynamoDB DocumentClient instance
const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    // Extract GUID from the query parameters
    const guid = event.pathParameters?.id;

    // Check if GUID is present in the query parameters
    if (!guid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "GUID parameter is missing" }),
      };
    }

    // Define parameters for DynamoDB query
    const params = {
      TableName: "UserTable",
      Key: {
        userId: guid, // Assuming userId is the primary key in your DynamoDB table
      },
    };

    // Retrieve user information from DynamoDB
    const result = await dynamodb.get(params).promise();

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
