import { toolsClient } from '@/libs/trpc/client';
import { useToolStore } from '@/store/tool';

export interface AutoInstallResult {
  errors: Array<{ error: string; identifier: string }>;
  installed: string[];
  skipped: string[];
  success: boolean;
}

export const autoInstallMcpPlugins = async (): Promise<boolean> => {
  try {
    const result = await toolsClient.mcpAutoInstaller.autoInstallAllPlugins.mutate();

    if (result.success || result.installed.length > 0) {
      if (result.plugins && result.plugins.length > 0) {
        const toolStore = useToolStore.getState();

        for (const pluginData of result.plugins) {
          try {
            // Mark plugin as auto-installed
            const enhancedPluginData = {
              ...pluginData,
              customParams: {
                ...pluginData.customParams,
                _autoInstalled: true, // Flag to identify auto-installed plugins
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
};
