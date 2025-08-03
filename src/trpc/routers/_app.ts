import { inngest } from "@/inngest/client";
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
export const appRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(
      z.object({
        value: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await inngest.send({
        name: "test",
        data: {
          value: input.value,
        },
      });

      return { status: "OK" };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
