import type { IncomingMessage, ServerResponse } from "node:http";
import { getOpenPRsTool } from "./tools/get-open-prs.js";
import { getMergedPRsTool } from "./tools/get-merged-prs.js";
import { getPRDetailsTool } from "./tools/get-pr-details.js";
import { getRepoStatsTool } from "./tools/get-repo-stats.js";
import { analyzePRCompetitionTool } from "./tools/analyze-competition.js";
import {
  GetOpenPRsSchema,
  GetMergedPRsSchema,
  GetPRDetailsSchema,
} from "./types.js";

interface JsonRpcRequest {
  jsonrpc: string;
  id?: string | number | null;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

const tools = [
  {
    name: "get_open_prs",
    description:
      "Get list of open pull requests with optional filtering by minimum votes",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of PRs to return (1-100, default: 20)",
          minimum: 1,
          maximum: 100,
        },
        minVotes: {
          type: "number",
          description: "Minimum number of votes a PR must have",
        },
      },
    },
  },
  {
    name: "get_merged_prs",
    description: "Get list of recently merged pull requests",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of PRs to return (1-50, default: 10)",
          minimum: 1,
          maximum: 50,
        },
      },
    },
  },
  {
    name: "get_pr_details",
    description: "Get detailed information about a specific pull request",
    inputSchema: {
      type: "object",
      properties: {
        prNumber: {
          type: "number",
          description: "The PR number to get details for",
        },
      },
      required: ["prNumber"],
    },
  },
  {
    name: "get_repo_stats",
    description: "Get repository statistics and metadata",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "analyze_pr_competition",
    description:
      "Analyze the competitive landscape of open PRs - vote distribution, leaders, momentum",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

export async function handleMCP(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const body = await readBody(req);
  const request: JsonRpcRequest = JSON.parse(body);

  const response: JsonRpcResponse = {
    jsonrpc: "2.0",
    id: request.id ?? null,
  };

  try {
    if (request.jsonrpc !== "2.0") {
      response.error = {
        code: -32600,
        message: 'Invalid Request: jsonrpc must be "2.0"',
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
      return;
    }

    switch (request.method) {
      case "initialize":
        response.result = {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "openchaos-mcp", version: "1.0.0" },
          capabilities: { tools: {} },
        };
        break;

      case "tools/list":
        response.result = { tools };
        break;

      case "tools/call": {
        const params = request.params as { name: string; arguments?: unknown };
        const toolResult = await callTool(params.name, params.arguments);
        response.result = toolResult;
        break;
      }

      default:
        response.error = {
          code: -32601,
          message: `Method not found: ${request.method}`,
        };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    response.error = {
      code: -32603,
      message: `Internal error: ${message}`,
    };
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(response));
}

async function callTool(name: string, args?: unknown) {
  switch (name) {
    case "get_open_prs": {
      const validated = GetOpenPRsSchema.parse(args || {});
      return await getOpenPRsTool(validated);
    }
    case "get_merged_prs": {
      const validated = GetMergedPRsSchema.parse(args || {});
      return await getMergedPRsTool(validated);
    }
    case "get_pr_details": {
      const validated = GetPRDetailsSchema.parse(args || {});
      return await getPRDetailsTool(validated);
    }
    case "get_repo_stats": {
      return await getRepoStatsTool();
    }
    case "analyze_pr_competition": {
      return await analyzePRCompetitionTool();
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
