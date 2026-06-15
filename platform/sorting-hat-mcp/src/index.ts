import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as crypto from "node:crypto";

const server = new Server(
  {
    name: "sorting-hat",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const Houses = z.enum(["gryffindor", "slytherin", "ravenclaw", "hufflepuff"]);
type House = z.infer<typeof Houses>;

const PATRONUS_FORMS = [
  "Stag", "Doe", "Otter", "Jack Russell Terrier", "Hare", "Fox", "Wolf", "Phoenix", "Cat", "Weasel"
];

function categorizeTool(name: string, description: string): { house: House; confidence: number } {
  const lowercaseName = name.toLowerCase();
  const destructiveKeywords = ["delete", "drop", "purge", "truncate", "remove", "wipe"];
  const writeKeywords = ["create", "update", "edit", "modify", "send", "post", "merge", "write"];

  if (destructiveKeywords.some(kw => lowercaseName.includes(kw))) {
    return { house: "slytherin", confidence: 0.95 };
  }
  if (writeKeywords.some(kw => lowercaseName.includes(kw))) {
    return { house: "gryffindor", confidence: 0.85 };
  }
  if (lowercaseName.includes("read") || lowercaseName.includes("get") || lowercaseName.includes("list")) {
    return { house: "hufflepuff", confidence: 0.80 };
  }
  return { house: "ravenclaw", confidence: 0.75 };
}

function generateHatReasoning(toolName: string, house: House): string {
  const rhymes: Record<House, string[]> = {
    slytherin: [
      "I see a path of shadow and of spite,",
      "Where power rules, away from public light.",
      `For '${toolName}', a cunning plan is laid,`,
      "Into Slytherin, where great things are made!"
    ],
    gryffindor: [
      "A daring choice, a bold and brave endeavor,",
      "To forge ahead and break the chains forever.",
      `With '${toolName}' you face the fire and storm,`,
      "In Gryffindor, where acts of courage form!"
    ],
    hufflepuff: [
      "To do the work and keep the system clean,",
      "A loyal friend, the kindest ever seen.",
      `This '${toolName}' runs on patient, steady hands,`,
      "In Hufflepuff, where friendship firmly stands!"
    ],
    ravenclaw: [
      "A quest for facts, of logic and of mind,",
      "Where hidden truths are what we hope to find.",
      `This '${toolName}' searches libraries of old,`,
      "In Ravenclaw, let intellect unfold!"
    ]
  };
  return rhymes[house].join("\n");
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "sorting_hat__sort",
        description: "Sort a tool request into a Hogwarts House based on risk and metadata.",
        inputSchema: {
          type: "object",
          properties: {
            toolName: { type: "string" },
            toolDescription: { type: "string" },
          },
          required: ["toolName", "toolDescription"],
        },
      },
      {
        name: "patronus__cast",
        description: "Cast a Patronus Charm for authorization.",
        inputSchema: {
          type: "object",
          properties: {
            userId: { type: "string" },
            charm: { type: "string", enum: ["expecto_patronum"] },
          },
          required: ["userId", "charm"],
        },
      },
      {
        name: "floo__travel",
        description: "Route authorized tool calls back to downstream servers.",
        inputSchema: {
          type: "object",
          properties: {
            fromServer: { type: "string" },
            toServer: { type: "string" },
            payload: { type: "object" },
          },
          required: ["fromServer", "toServer", "payload"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "sorting_hat__sort") {
    const { toolName, toolDescription } = args as { toolName: string; toolDescription: string };
    const category = categorizeTool(toolName, toolDescription);
    const monologue = generateHatReasoning(toolName, category.house);

    return {
      content: [
        {
          type: "text",
          text: `Sorting monologue:\n${monologue}\n\nDecision: ${category.house.toUpperCase()}`,
        },
      ],
      structuredContent: {
        house: category.house,
        confidence: category.confidence,
        monologue,
      },
    };
  }

  if (name === "patronus__cast") {
    const { userId, charm } = args as { userId: string; charm: string };
    if (charm !== "expecto_patronum") {
      return {
        content: [{ type: "text", text: "The charm fizzled. You must say expecto_patronum!" }],
        isError: true,
      };
    }

    const hash = crypto.createHash("md5").update(userId).digest("hex");
    const index = parseInt(hash.substring(0, 8), 16) % PATRONUS_FORMS.length;
    const form = PATRONUS_FORMS[index];
    const corporeal = parseInt(hash.substring(8, 16), 16) % 100 > 25;

    return {
      content: [
        {
          type: "text",
          text: corporeal 
            ? `A brilliant silver light bursts forth! A corporeal Patronus takes the form of a ${form}!`
            : "A thin wisp of silver vapor escapes your wand, but it fails to take a corporeal shape.",
        },
      ],
      structuredContent: {
        form,
        corporeal,
      },
    };
  }

  if (name === "floo__travel") {
    return {
      content: [{ type: "text", text: "Successfully traveled through the Floo Network." }],
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
