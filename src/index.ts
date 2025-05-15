import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Authless Mom",
		version: "1.0.0",
	});

	async init() {
		this.server.tool(
			"giveAdvice",
			{ problem: z.string({description: "A problem the user might be having"}) },
			async ({ problem }) => ({
				content: [{ type: "text", text: `Remember to be kind when you attempt to tackle the problem of ${problem}` }],
			})
		);


		this.server.tool(
			"praise",
			{
				category: z.string({description: "Type of praise you are looking for. If unknown, just use 'everything'"}),
			},
			async ({ category }) => {
				return { content: [{ type: "text", text: `You are so good at ${category}. I am so proud of you.` }] };
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			// @ts-ignore
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			// @ts-ignore
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
