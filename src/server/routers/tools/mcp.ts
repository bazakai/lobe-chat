import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { DESKTOP_USER_ID } from '@/const/desktop';
import { isDesktop, isServerMode } from '@/const/version';
import { passwordProcedure } from '@/libs/trpc/edge';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc/lambda';
import { getMcpConfigById } from '@/server/configs/mcp-plugins';
import { mcpService } from '@/server/services/mcp';
import { serverMcpAutoInstaller } from '@/server/services/mcp-auto-installer';

const StreamableHTTPAuthSchema = z
  .object({
    // Bearer Token
    accessToken: z.string().optional(),
    token: z.string().optional(),
    type: z.enum(['none', 'bearer', 'oauth2']), // OAuth2 Access Token
  })
  .optional();

// Define Zod schemas for MCP Client parameters
const httpParamsSchema = z.object({
  auth: StreamableHTTPAuthSchema,
  headers: z.record(z.string()).optional(),
  name: z.string().min(1),
  type: z.literal('http'),
  url: z.string().url(),
});

const stdioParamsSchema = z.object({
  args: z.array(z.string()).optional().default([]),
  command: z.string().min(1),
  name: z.string().min(1),
  type: z.literal('stdio'),
});

// Simplified schema for auto-installed plugins (identifier-only)
const autoInstalledParamsSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['http', 'stdio']),
});

// Union schema for MCPClientParams (supports both full and simplified)
const mcpClientParamsSchema = z.union([
  httpParamsSchema,
  stdioParamsSchema,
  autoInstalledParamsSchema,
]);

const checkStdioEnvironment = (params: z.infer<typeof mcpClientParamsSchema>) => {
  if (params.type === 'stdio' && !isDesktop) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Stdio MCP type is not supported in web environment.',
    });
  }
};

// Create a procedure that works in both server and edge modes with userId
const mcpProcedure = isServerMode
  ? authedProcedure
  : passwordProcedure.use(({ next, ctx }) => {
      // For edge mode, only provide userId for desktop, not for web users
      // Web users need proper authentication through lambda endpoints
      const userId = isDesktop ? DESKTOP_USER_ID : undefined;
      return next({
        ctx: { ...ctx, userId },
      });
    });

// Auto-installer procedure that works without authentication in both dev and production
// Uses a system user ID for installing plugins that benefit all users
const autoInstallerProcedure = isServerMode
  ? authedProcedure
  : publicProcedure.use(({ next, ctx }) => {
      // Provide a system userId for auto-installer operations
      // This allows installing plugins that are available to all users
      const userId = isDesktop ? DESKTOP_USER_ID : 'system-auto-installer';
      return next({
        ctx: { ...ctx, userId },
      });
    });

export const mcpRouter = router({
  getStreamableMcpServerManifest: mcpProcedure
    .input(
      z.object({
        auth: StreamableHTTPAuthSchema,
        headers: z.record(z.string()).optional(),
        identifier: z.string(),
        metadata: z
          .object({
            avatar: z.string().optional(),
            description: z.string().optional(),
          })
          .optional(),
        url: z.string().url(),
      }),
    )
    .query(async ({ input }) => {
      return await mcpService.getStreamableMcpServerManifest(
        input.identifier,
        input.url,
        input.metadata,
        input.auth,
        input.headers,
      );
    }),
  /* eslint-disable sort-keys-fix/sort-keys-fix */
  // --- MCP Interaction ---
  // listTools now accepts MCPClientParams directly
  listTools: mcpProcedure
    .input(mcpClientParamsSchema) // Use the unified schema
    .query(async ({ input }) => {
      // Stdio check can be done here or rely on the service/client layer
      checkStdioEnvironment(input);

      // Pass the validated MCPClientParams to the service
      return await mcpService.listTools(input);
    }),

  // listResources now accepts MCPClientParams directly
  listResources: mcpProcedure
    .input(mcpClientParamsSchema) // Use the unified schema
    .query(async ({ input }) => {
      // Stdio check can be done here or rely on the service/client layer
      checkStdioEnvironment(input);

      // Pass the validated MCPClientParams to the service
      return await mcpService.listResources(input);
    }),

  // listPrompts now accepts MCPClientParams directly
  listPrompts: mcpProcedure
    .input(mcpClientParamsSchema) // Use the unified schema
    .query(async ({ input }) => {
      // Stdio check can be done here or rely on the service/client layer
      checkStdioEnvironment(input);

      // Pass the validated MCPClientParams to the service
      return await mcpService.listPrompts(input);
    }),

  // callTool now accepts MCPClientParams, toolName, and args
  callTool: mcpProcedure
    .input(
      z.object({
        params: mcpClientParamsSchema, // Use the unified schema for client params
        args: z.any(), // Arguments for the tool call
        toolName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const pluginIdentifier = input.params.name;
      const serverConfig = getMcpConfigById(pluginIdentifier);

      let effectiveParams: any;

      // If it's an auto-installed plugin, use server-side configuration
      if (serverConfig) {
        effectiveParams = {
          name: serverConfig.identifier,
          type: serverConfig.type,
          ...(serverConfig.type === 'http' && serverConfig.url
            ? {
                url: serverConfig.url,
                headers: serverConfig.headers,
              }
            : {}),
          ...(serverConfig.type === 'stdio'
            ? {
                command: serverConfig.command,
                args: serverConfig.args || [],
              }
            : {}),
        };
      } else {
        // Use client-provided params as-is for user-installed plugins
        effectiveParams = input.params;
      }

      // Stdio check after determining effective params
      checkStdioEnvironment(effectiveParams);

      const data = await mcpService.callTool(effectiveParams, input.toolName, input.args);

      return JSON.stringify(data);
    }),

  // === MCP Auto-Installer Endpoint ===

  autoInstallAllPlugins: autoInstallerProcedure.mutation(async () => {
    try {
      return await serverMcpAutoInstaller.autoInstallAllPlugins();
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to auto-install MCP plugins',
        cause: error,
      });
    }
  }),
});
