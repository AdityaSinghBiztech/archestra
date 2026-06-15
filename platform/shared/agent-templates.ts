export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  modelName: string;
  provider: string;
  mcpServers: string[]; // required catalog items
  tools: string[]; // tools to assign
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "developer-agent",
    name: "Developer Subagent",
    description: "Equipped with filesystem, terminal, and git tools for coding automation.",
    icon: "💻",
    systemPrompt: "You are a senior software engineering assistant. Write high-quality code, follow design documents, and debug errors.",
    modelName: "claude-3-5-sonnet",
    provider: "anthropic",
    mcpServers: ["github-mcp", "terminal-mcp"],
    tools: ["github__list_issues", "github__create_pr", "terminal__run_command"]
  },
  {
    id: "researcher-agent",
    name: "Research Analyst",
    description: "Perfect for compiling facts, searching papers, and querying Wikipedia.",
    icon: "🔍",
    systemPrompt: "You are a research analyst. Fetch papers, search the web, and build objective summaries based on verified details.",
    modelName: "gpt-4o",
    provider: "openai",
    mcpServers: ["arxiv-mcp", "web-search-mcp"],
    tools: ["arxiv__search_papers", "web_search__google_query"]
  }
];
