import { inngest } from "@/inngest/client";
import { TRPCError } from "@trpc/server";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const projectsRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        prompt: z
          .string()
          .trim()
          .min(1, { message: "Prompt message is required" })
          .max(1000, { message: "Prompt message is too long" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: generateSlug(2, {
            format: "kebab",
          }),

          messages: {
            create: {
              content: input.prompt,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      await inngest.send({
        name: "generator/run",
        data: {
          value: input.prompt,
          projectId: project.id,
        },
      });

      return project;
    }),

  getAll: baseProcedure.query(async ({ ctx }) => {
    const projects = ctx.db.project.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    return projects;
  }),

  getById: baseProcedure
    .input(
      z.object({
        projectId: z.string().uuid({ message: "Invalid project id format" }),
      })
    )
    .query(({ input, ctx }) => {
      const project = ctx.db.project.findUnique({
        where: {
          id: input.projectId,
        },
      });

      if (!project) {
        throw new TRPCError({
          message: "No record found",
          code: "NOT_FOUND",
        });
      }

      return project;
    }),
});
