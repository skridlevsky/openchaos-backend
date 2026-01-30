import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { getOpenPRsTool } from "./tools/get-open-prs.js";
import { getMergedPRsTool } from "./tools/get-merged-prs.js";
import { getPRDetailsTool } from "./tools/get-pr-details.js";
import { getRepoStatsTool } from "./tools/get-repo-stats.js";
import { analyzePRCompetitionTool } from "./tools/analyze-competition.js";
import {
  GetOpenPRsSchema,
  GetMergedPRsSchema,
  GetPRDetailsSchema
} from "./types.js";

export function createMCPServer() {
  const server = new Server(
    {
      name: "openchaos-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_open_prs",
        description: "Get list of open pull requests with optional filtering by minimum votes",
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
        description: "Analyze the competitive landscape of open PRs - vote distribution, leaders, momentum",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

export async function runMCPServer() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
