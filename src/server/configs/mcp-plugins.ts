import { McpConfig } from '@/types/mcp';
import { getMemoizedParsedSecret } from '@/utils/server/secrets';

/**
 * Server-side MCP plugin configurations containing sensitive data
 * These configurations are NEVER sent to the client
 */
let _serverMcpConfigs: McpConfig[] | null = null;

/**
 * Get MCP configurations with secrets loaded from Google Secret Manager
 */
async function getServerMcpConfigs(): Promise<McpConfig[]> {
  if (_serverMcpConfigs) {
    return _serverMcpConfigs;
  }

  try {
    // Get secrets from Google Secret Manager
    const { zap } = await getMemoizedParsedSecret<
      Record<string, { bazakApiKey: string; id: string }>
    >({ secretName: 'mcp-configs' });

    _serverMcpConfigs = [
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
        url: `https://mcp.bazak.ai/${zap.id}/mcp?bazak-api-key=${zap.bazakApiKey}`,
      },

      // Add more HTTP MCP server configurations here
    ];

    return _serverMcpConfigs;
  } catch (error) {
    console.error('Failed to load MCP configurations from secrets:', error);
    // Return empty array if secrets can't be loaded
    return [];
  }
}

/**
 * Get full configuration by identifier (server-side only)
 */
export async function getMcpConfigById(identifier: string): Promise<McpConfig | undefined> {
  const configs = await getServerMcpConfigs();
  return configs.find((config) => config.identifier === identifier);
}

/**
 * Get all server MCP configurations
 */
export async function getServerMcpConfigsArray(): Promise<McpConfig[]> {
  return getServerMcpConfigs();
}
