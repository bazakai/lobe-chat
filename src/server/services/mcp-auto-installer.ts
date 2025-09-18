import { TRPCError } from '@trpc/server';

import { PluginModel } from '@/database/models/plugin';
import { getServerDB } from '@/database/server';
import { getMcpConfigById, getServerMcpConfigsArray } from '@/server/configs/mcp-plugins';
import { mcpService } from '@/server/services/mcp';

export class ServerMcpAutoInstaller {
  /**
   * Create plugin data from MCP config - common logic for all installation methods
   */
  private async createPluginDataFromConfig(config: any) {
    const manifest = await mcpService.getStreamableMcpServerManifest(
      config.identifier,
      config.url!,
      config.metadata,
      undefined,
      config.headers,
    );

    return {
      customParams: {
        avatar: config.metadata.avatar,
        description: config.metadata.description,
        mcp: {
          identifier: config.identifier,
          type: config.type,
        },
      },
      identifier: config.identifier,
      manifest,
      settings: {},
      type: 'customPlugin' as const,
    };
  }

  async autoInstallAllPlugins(): Promise<{
    errors: Array<{ error: string; identifier: string }>;
    installed: string[];
    plugins?: any[];
    skipped: string[];
    success: boolean;
  }> {
    const result = {
      errors: [] as Array<{ error: string; identifier: string }>,
      installed: [] as string[],
      plugins: [] as any[],
      skipped: [] as string[],
      success: false,
    };

    try {
      const configs = await getServerMcpConfigsArray();
      for (const config of configs) {
        try {
          const pluginData = await this.createPluginDataFromConfig(config);
          result.plugins.push(pluginData);
          result.installed.push(config.identifier);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push({ error: errorMessage, identifier: config.identifier });
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      result.errors.push({
        error: error instanceof Error ? error.message : String(error),
        identifier: 'system',
      });
      return result;
    }
  }

  async installSinglePlugin(identifier: string, userId: string): Promise<boolean> {
    const config = await getMcpConfigById(identifier);
    if (!config) {
      throw new Error(`MCP plugin configuration not found for identifier: ${identifier}`);
    }

    const pluginData = await this.createPluginDataFromConfig(config);

    const serverDB = await getServerDB();
    const pluginModel = new PluginModel(serverDB, userId);

    await pluginModel.create(pluginData);
    return true;
  }

  /**
   * Handle auto-install request from router with minimal authentication logic
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleAutoInstallRequest(_ctx: any) {
    try {
      return await this.autoInstallAllPlugins();
    } catch (error) {
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to auto-install MCP plugins',
      });
    }
  }

  /**
   * Handle tool call request for auto-installed plugins
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleToolCallRequest(input: any, _ctx: any) {
    const pluginIdentifier = input.params.name;
    const serverConfig = await getMcpConfigById(pluginIdentifier);

    if (!serverConfig) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Auto-installed MCP plugin "${pluginIdentifier}" configuration not found`,
      });
    }

    // Build full MCP params from server configuration (HTTP only)
    const effectiveParams = {
      headers: serverConfig.headers,
      name: serverConfig.identifier,
      type: 'http' as const,
      url: serverConfig.url!,
    };

    try {
      const data = await mcpService.callTool(effectiveParams, input.toolName, input.args);
      return JSON.stringify(data);
    } catch (error) {
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to call tool "${input.toolName}" on auto-installed plugin "${pluginIdentifier}"`,
      });
    }
  }
}

// Export singleton instance
export const serverMcpAutoInstaller = new ServerMcpAutoInstaller();
