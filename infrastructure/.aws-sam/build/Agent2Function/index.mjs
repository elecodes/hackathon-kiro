// Agent 2 Lambda Handler — Software Architect Spec Generator
// POST /generate-spec → generates and persists spec to DynamoDB
// GET /specs/{specId} → retrieves a previously generated spec

import { mockResponse } from "./mock-response.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const eventBridge = new EventBridgeClient({});
const TABLE_NAME = process.env.SPECS_TABLE || "kirospec-specs";
const EVENT_BUS = "kirospec-pipeline";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    if (event.httpMethod === "GET") {
      return await handleGet(event);
    }
    return await handlePost(event);
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
        category: "LAMBDA_ERROR",
      }),
    };
  }
};

// POST /generate-spec — Generate and persist spec
async function handlePost(event) {
  let body = {};
  if (event.body) {
    body = JSON.parse(
      event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString()
        : event.body,
    );
  }

  const { agent1Output, preferredStack } = body;

  // Generate spec (mock mode — no LLM needed)
  const result = {
    ...mockResponse,
    ...(preferredStack && {
      techSteering: { ...mockResponse.techSteering, stack: preferredStack },
    }),
  };

  // Create unique spec ID
  const specId = `spec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = new Date().toISOString();

  // Persist to DynamoDB
  await dynamo.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `SPEC#${specId}`,
        SK: `AGENT#2#${timestamp}`,
        specId,
        agent: "agent-2-architect",
        mode: "mock",
        timestamp,
        input: agent1Output || "fallback-mock",
        output: result,
        // TTL: auto-delete after 30 days (free tier friendly)
        ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      },
    }),
  );

  // Emit event to EventBridge — triggers downstream agents (Agent 3, 4)
  await eventBridge.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: EVENT_BUS,
          Source: "kirospec.agent2",
          DetailType: "SpecGenerated",
          Detail: JSON.stringify({
            specId,
            agent: "agent-2-architect",
            timestamp,
            stack: result.techSteering.stack,
          }),
        },
      ],
    }),
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: result,
      metadata: {
        specId,
        agent: "agent-2-architect",
        mode: "mock",
        timestamp,
        input: agent1Output ? "provided" : "fallback-mock",
        persisted: true,
        eventEmitted: true,
      },
    }),
  };
}

// GET /specs/{specId} — Retrieve a previously generated spec
async function handleGet(event) {
  const specId = event.pathParameters?.specId;

  if (!specId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: "specId is required" }),
    };
  }

  const result = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `SPEC#${specId}`,
        SK: `AGENT#2#`,
      },
    }),
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: "Spec not found" }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: result.Item.output,
      metadata: {
        specId: result.Item.specId,
        timestamp: result.Item.timestamp,
        agent: result.Item.agent,
      },
    }),
  };
}
