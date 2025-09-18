import { PluginModel } from '@/database/models/plugin';
import { getServerDB } from '@/database/server';
import { SERVER_MCP_CONFIGS, getMcpConfigById } from '@/server/configs/mcp-plugins';
import { mcpService } from '@/server/services/mcp';

export class ServerMcpAutoInstaller {
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
      for (const config of SERVER_MCP_CONFIGS) {
        try {
          // Only HTTP MCP servers are supported
          const manifest = await mcpService.getStreamableMcpServerManifest(
            config.identifier,
            config.url!,
            config.metadata,
            undefined,
            config.headers,
          );

          const pluginData = {
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
    const config = getMcpConfigById(identifier);
    if (!config) {
      throw new Error(`MCP plugin configuration not found for identifier: ${identifier}`);
    }

    // Only HTTP MCP servers are supported
    const manifest = await mcpService.getStreamableMcpServerManifest(
      config.identifier,
      config.url!,
      config.metadata,
      undefined,
      config.headers,
    );

    const pluginData = {
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

    const serverDB = await getServerDB();
    const pluginModel = new PluginModel(serverDB, userId);

    await pluginModel.create(pluginData);
    return true;
  }
}

// Export singleton instance
export const serverMcpAutoInstaller = new ServerMcpAutoInstaller();
