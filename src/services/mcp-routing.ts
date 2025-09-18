import { toolsClient } from '@/libs/trpc/client';
import { ChatToolPayload } from '@/types/message';

/**
 * MCP Routing Service
 * Routes MCP calls to either the original MCP service or auto-installer service
 * based on whether the plugin is auto-installed or user-installed
 */

export class McpRoutingService {
  /**
   * Route tool calls to the appropriate service based on plugin type
   */
  async invokeMcpToolCall(
    payload: ChatToolPayload,
    options: { signal?: AbortSignal; topicId?: string },
  ) {
    const { identifier, arguments: args, apiName } = payload;

    // Check if this is an auto-installed plugin
    const isAutoInstalled = await this.isAutoInstalledPlugin(identifier);

    if (isAutoInstalled) {
      // Route to auto-installer service with simplified params
      return this.callAutoInstalledPlugin(identifier, apiName, args, options);
    } else {
      // Route to original MCP service
      return this.callUserInstalledPlugin(payload, options);
    }
  }

  /**
   * Check if a plugin is auto-installed by looking for the _autoInstalled flag
   */
  private async isAutoInstalledPlugin(identifier: string): Promise<boolean> {
    try {
      const { pluginSelectors } = await import('@/store/tool/selectors');
      const { getToolStoreState } = await import('@/store/tool/store');

      const s = getToolStoreState();
      const customPlugin = pluginSelectors.getCustomPluginById(identifier)(s);

      return (customPlugin?.customParams as any)?._autoInstalled === true;
    } catch {
      return false;
    }
  }

  /**
   * Call auto-installed plugin through dedicated auto-installer router
   */
  private async callAutoInstalledPlugin(
    identifier: string,
    toolName: string,
    args: any,
    options: { signal?: AbortSignal; topicId?: string },
  ) {
    const data = {
      args,
      params: {
        name: identifier,
        type: 'http' as const, // Server will determine actual type
      },
      toolName,
    };

    return toolsClient.mcpAutoInstaller.callTool.mutate(data, { signal: options.signal });
  }

  /**
   * Call user-installed plugin through original MCP service
   */
  private async callUserInstalledPlugin(
    payload: ChatToolPayload,
    options: { signal?: AbortSignal; topicId?: string },
  ) {
    // Import the original MCP service to avoid circular dependencies
    const { mcpService } = await import('./mcp');
    return mcpService.invokeMcpToolCallOriginal(payload, options);
  }
}

// Export singleton instance
export const mcpRoutingService = new McpRoutingService();
