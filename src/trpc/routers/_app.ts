import { createTRPCRouter } from "../init";
import { messagesRouter } from "./messages";
import { projectsRouter } from "./projects";
import { subscriptionsRouter } from "./subscriptions";

export const appRouter = createTRPCRouter({
  message: messagesRouter,
  project: projectsRouter,
  subscription: subscriptionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
