import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError: ({ path, error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(
          `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
        );
        console.error(error);
      }
    },
  });

export { handler as GET, handler as POST };
