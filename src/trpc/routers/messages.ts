import { inngest } from "@/inngest/client";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const messagesRouter = createTRPCRouter({
  create: protectedProcedure
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
      const remainingCredits =
        ctx.subscription.dailyCreditRemaining +
        (ctx.subscription.monthlyCreditRemaining ?? 0);

      if (remainingCredits <= 0) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have run out of credits",
        });
      }

      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      });
      if (!project) {
        throw new TRPCError({
          message: "Oops! no project record found.",
          code: "NOT_FOUND",
        });
      }

      const message = await ctx.db.message.create({
        data: {
          content: input.prompt,
          role: "USER",
          type: "RESULT",
          projectId: project.id,
        },
      });

      await inngest.send({
        name: "generator/run",
        data: {
          userId: ctx.auth.userId,
          value: message.content,
          projectId: message.projectId,
        },
      });

      return message;
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid({ message: "Invalid project id format" }),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = ctx.db.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId,
          },
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
