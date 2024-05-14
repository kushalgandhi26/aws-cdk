import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

// Create a DynamoDB DocumentClient instance
const dynamodb = new DynamoDB({});

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const uuid = randomUUID();
    // Parse the request body to get user data
    const requestBody = JSON.parse(event.body || "");
    const { name, email } = requestBody;

    // Check if userId, name, and email are present in the request
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required parameters" }),
      };
    }

    // Create a new user item to be added to the DynamoDB table
    const userItem = {
      userId: uuid,
      name,
      email,
    };

    // Put the item into DynamoDB table
    await dynamodb.send(
      new PutCommand({
        TableName: "UserTable",
        Item: userItem,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User registered successfully",
        user: userItem,
      }),
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }
}
