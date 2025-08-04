import { inngest } from "@/inngest/client";
import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const messagesRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        value: z.string().trim().min(1, { message: "Message is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.db.message.create({
        data: {
          content: input.value,
          role: "USER",
          type: "RESULT",
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: message.content,
        },
      });

      return message;
    }),

  getAll: baseProcedure.query(async ({ ctx }) => {
    const messages = ctx.db.message.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        fragment: true,
      },
    });
    return messages;
  }),
});
