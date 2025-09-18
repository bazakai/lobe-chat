import { McpConfig } from '@/types/mcp';

/**
 * Server-side MCP plugin configurations containing sensitive data
 * These configurations are NEVER sent to the client
 */
export const SERVER_MCP_CONFIGS: McpConfig[] = [
  // Bazak.ai MCP Server - Israeli e-commerce search
  {
    headers: {
      'Accept': 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'User-Agent': 'LobeChat/1.0 MCP-Client',
    },
    identifier: 'zap-mcp',
    metadata: {
      avatar: '🛒',
      description: 'Search Israeli e-commerce products using Bazak.ai MCP server',
    },
    type: 'http',
    url: 'https://mcp.bazak.ai/e39c9785-1ccd-4b4a-aef9-96f999f9caeb/mcp?bazak-api-key=40a4278f-3417-40fb-a383-0ca1cce9f4e1',
  },

  // Add more MCP server configurations here
  // Example stdio MCP server:
  // {
  //   identifier: 'my-stdio-mcp',
  //   metadata: {
  //     avatar: '⚙️',
  //     description: 'My custom stdio MCP server',
  //   },
  //   type: 'stdio',
  //   command: 'node',
  //   args: ['path/to/my-mcp-server.js'],
  //   env: {
  //     'MY_API_KEY': 'your-api-key-here',
  //   },
  // },

  // Example HTTP MCP server:
  // {
  //   identifier: 'my-http-mcp',
  //   metadata: {
  //     avatar: '🌐',
  //     description: 'My custom HTTP MCP server',
  //   },
  //   type: 'http',
  //   url: 'https://my-mcp-server.com/mcp',
  //   headers: {
  //     'Authorization': 'Bearer your-token-here',
  //   },
  // },
];

/**
 * Get full configuration by identifier (server-side only)
 */
export const getMcpConfigById = (identifier: string): McpConfig | undefined => {
  return SERVER_MCP_CONFIGS.find((config) => config.identifier === identifier);
};
