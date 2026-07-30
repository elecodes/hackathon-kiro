// Agent 2 Lambda Handler — Software Architect Spec Generator
// Receives product vision input, returns validated architecture specs
// Uses mock response for offline/free-tier operation (no LLM API needed)

import { mockResponse } from "./mock-response.mjs";

/**
 * Lambda handler for Agent 2.
 * Accepts POST with optional agent1Output and preferredStack.
 * Returns a validated Agent2Output (tech steering, requirements, design, tasks).
 */
export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Parse request body
    let body = {};
    if (event.body) {
      body = JSON.parse(
        event.isBase64Encoded
          ? Buffer.from(event.body, "base64").toString()
          : event.body,
      );
    }

    const { agent1Output, preferredStack } = body;

    // For free-tier operation, return mock response
    // In production, this would invoke the LLM via Vercel AI SDK or Bedrock
    const result = {
      ...mockResponse,
      // Override stack if preferredStack is provided
      ...(preferredStack && {
        techSteering: {
          ...mockResponse.techSteering,
          stack: preferredStack,
        },
      }),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result,
        metadata: {
          agent: "agent-2-architect",
          mode: "mock",
          timestamp: new Date().toISOString(),
          input: agent1Output ? "provided" : "fallback-mock",
        },
      }),
    };
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
