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
    url: 'https://mcp.bazak.ai/1f6da9f6-ab07-4b99-8395-a27f49aec057/mcp?bazak-api-key=ccb1d257-866d-4920-9c29-e970bb81f83c',
  },

  // Add more HTTP MCP server configurations here
  // Example:
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
