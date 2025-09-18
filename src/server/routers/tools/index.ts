import { publicProcedure, router } from '@/libs/trpc/lambda';

import { mcpRouter } from './mcp';
import { mcpAutoInstallerRouter } from './mcp-auto-installer';
import { searchRouter } from './search';

export const toolsRouter = router({
  healthcheck: publicProcedure.query(() => "i'm live!"),
  mcp: mcpRouter,
  mcpAutoInstaller: mcpAutoInstallerRouter,
  search: searchRouter,
});

export type ToolsRouter = typeof toolsRouter;
