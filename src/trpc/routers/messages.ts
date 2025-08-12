import { inngest } from "@/inngest/client";
import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const messagesRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        prompt: z
          .string()
          .trim()
          .min(1, { message: "Prompt message is required" })
          .max(1000, { message: "Prompt message is too long" }),
        projectId: z.string().uuid({ message: "Invalid project id format" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.db.message.create({
        data: {
          content: input.prompt,
          role: "USER",
          type: "RESULT",
          projectId: input.projectId,
        },
      });

      await inngest.send({
        name: "generator/run",
        data: {
          value: message.content,
          projectId: message.projectId,
        },
      });

      return message;
    }),

  getAll: baseProcedure
    .input(
      z.object({
        projectId: z.string().uuid({ message: "Invalid project id format" }),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = ctx.db.message.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          updatedAt: "asc",
        },
        include: {
          fragment: true,
        },
      });
      return messages;
    }),
});
