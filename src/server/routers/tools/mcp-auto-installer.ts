import { z } from 'zod';

import { isServerMode } from '@/const/version';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc/lambda';
import { serverMcpAutoInstaller } from '@/server/services/mcp-auto-installer';

// Simple procedure for auto-installer
const autoInstallerProcedure = isServerMode ? authedProcedure : publicProcedure;

export const mcpAutoInstallerRouter = router({
  // Auto-install all available MCP plugins
  autoInstallAllPlugins: autoInstallerProcedure.mutation(async ({ ctx }) => {
    return await serverMcpAutoInstaller.handleAutoInstallRequest(ctx);
  }),

  // Call tool for auto-installed plugins
  callTool: autoInstallerProcedure
    .input(
      z.object({
        args: z.any(),
        params: z.object({ name: z.string(), type: z.literal('http') }),
        toolName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await serverMcpAutoInstaller.handleToolCallRequest(input, ctx);
    }),
});
