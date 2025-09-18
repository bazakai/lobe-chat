export interface AutoInstallResult {
  errors: Array<{ error: string; identifier: string }>;
  installed: string[];
  skipped: string[];
  success: boolean;
}

export const autoInstallMcpPlugins = async (): Promise<boolean> => {
  // Delegate to wrapper service
  const { mcpAutoInstallerWrapper } = await import('./mcp-auto-installer-wrapper');
  return mcpAutoInstallerWrapper.autoInstallAllPlugins();
};
