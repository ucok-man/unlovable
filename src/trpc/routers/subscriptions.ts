import { createTRPCRouter, protectedProcedure } from "../init";

export const subscriptionsRouter = createTRPCRouter({
  getMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.subscription;
  }),
});
