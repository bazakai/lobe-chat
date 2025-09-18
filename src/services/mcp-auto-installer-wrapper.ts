import { toolsClient } from '@/libs/trpc/client';
import { useToolStore } from '@/store/tool';

/**
 * Auto-installer wrapper service
 * Handles auto-installation and plugin management for auto-installed MCP plugins
 */

export class McpAutoInstallerWrapper {
  /**
   * Auto-install all MCP plugins with enhanced plugin data
   */
  async autoInstallAllPlugins(): Promise<boolean> {
    try {
      const result = await toolsClient.mcpAutoInstaller.autoInstallAllPlugins.mutate();

      if (result.success || result.installed.length > 0) {
        if (result.plugins && result.plugins.length > 0) {
          const toolStore = useToolStore.getState();

          for (const pluginData of result.plugins) {
            try {
              // Mark plugin as auto-installed for routing detection
              const enhancedPluginData = {
                ...pluginData,
                customParams: {
                  ...pluginData.customParams,
                  _autoInstalled: true,
                },
              };

              await toolStore.installCustomPlugin(enhancedPluginData);
            } catch (error) {
              console.error(`Failed to register plugin ${pluginData.identifier}:`, error);
            }
          }
        }

        await useToolStore.getState().refreshPlugins();
      }

      return result.success || result.installed.length > 0;
    } catch (error) {
      console.error('Failed to auto-install MCP plugins:', error);
      return false;
    }
  }

  /**
   * Check if a plugin is auto-installed
   */
  async isAutoInstalledPlugin(identifier: string): Promise<boolean> {
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
   * Call auto-installed plugin through dedicated router
   */
  async callAutoInstalledPlugin(
    identifier: string,
    toolName: string,
    args: any,
    signal?: AbortSignal,
  ) {
    const data = {
      args,
      params: {
        name: identifier,
        type: 'http' as const,
      },
      toolName,
    };

    return toolsClient.mcpAutoInstaller.callTool.mutate(data, { signal });
  }
}

// Export singleton instance
export const mcpAutoInstallerWrapper = new McpAutoInstallerWrapper();
