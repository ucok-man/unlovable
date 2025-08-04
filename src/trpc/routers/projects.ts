import { inngest } from "@/inngest/client";
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
});
