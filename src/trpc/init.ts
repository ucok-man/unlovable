import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import type { PrismaClient } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export const createTRPCContext = cache(async () => {
  return { db: db as PrismaClient, auth: await auth() };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      message: "not authenticated",
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth!,
    },
  });
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(isAuthed);
