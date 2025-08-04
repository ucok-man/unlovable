import { createTRPCRouter } from "../init";
import { messagesRouter } from "./messages";

export const appRouter = createTRPCRouter({
  message: messagesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
