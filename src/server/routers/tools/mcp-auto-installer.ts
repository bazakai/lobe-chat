import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { DESKTOP_USER_ID } from '@/const/desktop';
import { isDesktop, isServerMode } from '@/const/version';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc/lambda';
import { getMcpConfigById } from '@/server/configs/mcp-plugins';
import { mcpService } from '@/server/services/mcp';
import { serverMcpAutoInstaller } from '@/server/services/mcp-auto-installer';

// Simplified schema for auto-installed plugins (identifier-only)
const autoInstalledParamsSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['http', 'stdio']),
});

const checkStdioEnvironment = (params: { type: string }) => {
  if (params.type === 'stdio' && !isDesktop) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Stdio MCP type is not supported in web environment.',
    });
  }
};

// Auto-installer procedure that works without authentication in both dev and production
const autoInstallerProcedure = isServerMode
  ? authedProcedure
  : publicProcedure.use(({ next, ctx }) => {
      // Provide a system userId for auto-installer operations
      const userId = isDesktop ? DESKTOP_USER_ID : 'system-auto-installer';
      return next({
        ctx: { ...ctx, userId },
      });
    });

export const mcpAutoInstallerRouter = router({
  // Auto-install all available MCP plugins
  autoInstallAllPlugins: autoInstallerProcedure.mutation(async () => {
    try {
      return await serverMcpAutoInstaller.autoInstallAllPlugins();
    } catch (error) {
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to auto-install MCP plugins',
      });
    }
  }),

  // Call tool for auto-installed plugins (with server-side parameter substitution)
  callTool: autoInstallerProcedure
    .input(
      z.object({
        args: z.any(),
        params: autoInstalledParamsSchema,
        toolName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const pluginIdentifier = input.params.name;
      const serverConfig = getMcpConfigById(pluginIdentifier);

      if (!serverConfig) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Auto-installed MCP plugin "${pluginIdentifier}" configuration not found`,
        });
      }

      // Build full MCP params from server configuration
      const effectiveParams: any = {
        name: serverConfig.identifier,
        type: serverConfig.type,
        ...(serverConfig.type === 'http' && serverConfig.url
          ? {
              headers: serverConfig.headers,
              url: serverConfig.url,
            }
          : {}),
        ...(serverConfig.type === 'stdio'
          ? {
              args: serverConfig.args || [],
              command: serverConfig.command,
            }
          : {}),
      };

      // Stdio environment check
      checkStdioEnvironment(effectiveParams);

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
    }),
});
