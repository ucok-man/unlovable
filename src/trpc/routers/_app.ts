import { createTRPCRouter } from "../init";
import { messagesRouter } from "./messages";
import { projectsRouter } from "./projects";

export const appRouter = createTRPCRouter({
  message: messagesRouter,
  project: projectsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
