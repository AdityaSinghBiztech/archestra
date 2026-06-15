import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "windmill-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "windmill__create_workflow",
        description: "Create a workflow in Windmill.",
        inputSchema: {
          type: "object",
          properties: {
            workspace: { type: "string" },
            path: { type: "string" },
            value: { type: "object", description: "JSON graph description of nodes" }
          },
          required: ["workspace", "path", "value"]
        }
      },
      {
        name: "windmill__execute_workflow",
        description: "Run a Windmill workflow by path.",
        inputSchema: {
          type: "object",
          properties: {
            workspace: { type: "string" },
            path: { type: "string" },
            inputs: { type: "object" }
          },
          required: ["workspace", "path", "inputs"]
        }
      }
    ]
  };
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "windmill://editor",
        name: "Windmill Interactive Workflow Canvas",
        mimeType: "text/html",
        description: "Embedded visual editor for Windmill nodes and connections."
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri === "windmill://editor") {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body, html { margin:0; padding:0; height:100%; overflow:hidden; }
            iframe { border:0; width:100%; height:100%; }
          </style>
        </head>
        <body>
          <iframe id="windmill-frame" src="https://app.windmill.dev/w/default/flows/edit"></iframe>
          <script>
            window.addEventListener("message", (event) => {
              if (event.data && event.data.type === "archestra:ready") {
                console.log("Archestra App framework attached.");
              }
            });
          </script>
        </body>
      </html>
    `;
    return {
      contents: [
        {
          uri,
          mimeType: "text/html",
          text: html
        }
      ]
    };
  }
  throw new Error("Resource not found");
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "windmill__create_workflow") {
    const { workspace, path, value } = args as { workspace: string; path: string; value: Record<string, unknown> };
    return {
      content: [
        {
          type: "text",
          text: `Successfully created Windmill workflow at path: ${path} in workspace: ${workspace}.`,
        },
      ],
      structuredContent: {
        success: true,
        workspace,
        path,
        value,
      },
    };
  }

  if (name === "windmill__execute_workflow") {
    const { workspace, path, inputs } = args as { workspace: string; path: string; inputs: Record<string, unknown> };
    return {
      content: [
        {
          type: "text",
          text: `Successfully executed Windmill workflow at path: ${path} in workspace: ${workspace}.`,
        },
      ],
      structuredContent: {
        success: true,
        workspace,
        path,
        inputs,
        result: {
          status: "completed",
          output: { message: "Workflow executed successfully mock output" },
        },
      },
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
