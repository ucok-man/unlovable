import { db } from "@/lib/db";
import { DAILY_CREDITS, MONTHLY_CREDITS } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import type { PrismaClient } from "@prisma/client";
import { Subscription } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { isBefore } from "date-fns";
import { cache } from "react";
import superjson from "superjson";

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export const createTRPCContext = cache(async () => {
  return { db: db as PrismaClient, auth: await auth(), subscription: null } as {
    db: typeof db;
    auth: Awaited<ReturnType<typeof auth>>;
    subscription: null | Subscription;
  };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const withAuthStrict = t.middleware(({ next, ctx }) => {
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

const withSubscriptionStrict = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      message: "not authenticated",
      code: "UNAUTHORIZED",
    });
  }

  let subscription = await ctx.db.subscription.findUnique({
    where: {
      userId: ctx.auth.userId,
    },
  });
  if (!subscription) {
    subscription = await ctx.db.subscription.create({
      data: {
        userId: ctx.auth.userId,
        plan: "FREE",
        dailyCreditRemaining: DAILY_CREDITS.credit,
        dailyCreditConsumed: 0,
        dailyReset: new Date(Date.now() + DAILY_CREDITS.resetDuration),
      },
    });
  }

  /* ----------------- Sync with subscription clerk ----------------- */

  const { has } = await auth();
  const isFreePlan = has({ plan: "free_user" });
  const isProPlan = has({ plan: "pro_user" });

  if (isFreePlan && subscription.plan !== "FREE") {
    subscription = await ctx.db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        plan: "FREE",
        monthlyCreditRemaining: null,
        monthlyCreditConsumed: null,
        monthlyReset: null,
      },
    });
  }

  if (isProPlan && subscription.plan !== "PRO") {
    subscription = await ctx.db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        plan: "PRO",
        monthlyCreditRemaining: MONTHLY_CREDITS.credit,
        monthlyCreditConsumed: 0,
        monthlyReset: new Date(Date.now() + MONTHLY_CREDITS.resetDuration),
      },
    });
  }

  /* ------------------- Check subscription reset ------------------- */

  const isResetDaily = !isBefore(new Date(), subscription.dailyReset!);
  const isResetMonthly =
    subscription.monthlyReset &&
    !isBefore(new Date(), subscription.monthlyReset);

  if (isResetDaily) {
    subscription = await ctx.db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        dailyCreditRemaining: DAILY_CREDITS.credit,
        dailyCreditConsumed: 0,
        dailyReset: new Date(Date.now() + DAILY_CREDITS.resetDuration),
      },
    });
  }
  if (isResetMonthly) {
    subscription = await ctx.db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        monthlyCreditRemaining: MONTHLY_CREDITS.credit,
        monthlyCreditConsumed: 0,
        monthlyReset: new Date(Date.now() + DAILY_CREDITS.resetDuration),
      },
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
      subscription: subscription,
    },
  });
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure
  .use(withAuthStrict)
  .use(withSubscriptionStrict);
