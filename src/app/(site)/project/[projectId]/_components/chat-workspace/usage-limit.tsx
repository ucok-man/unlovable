"use client";

import { Button } from "@/components/ui/button";
import type { Subscription } from "@prisma/client";
import { formatDuration, intervalToDuration } from "date-fns";
import { ChevronDown, ChevronUp, Crown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Props = {
  subscription: Subscription;
  defaultExpanded?: boolean;
};

export default function UsageLimit({
  subscription,
  defaultExpanded = true,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  let remainingCredit = subscription.dailyCreditRemaining;
  if (subscription.plan === "PRO") {
    remainingCredit += subscription.monthlyCreditRemaining!;
  }

  return (
    <div className="rounded-t-xl bg-background border border-b-0 p-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <p className="text-sm font-medium">
            {remainingCredit} free credits remaining
          </p>
          <Button asChild size="sm" variant="default">
            <Link href="/pricing" className="flex items-center gap-2">
              <Crown className="size-4" />
              <span>Upgrade</span>
            </Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border/50 animate-in slide-in-from-top-1 duration-200">
          <p className="text-xs text-muted-foreground">
            5 free daily credits in{" "}
            {formatDuration(
              intervalToDuration({
                start: new Date(),
                end: subscription.dailyReset,
              }),
              { format: ["months", "days", "hours"] }
            )}
          </p>
          {subscription.plan === "PRO" && (
            <p className="text-xs text-muted-foreground mt-1">
              100 monthly credits in{" "}
              {formatDuration(
                intervalToDuration({
                  start: new Date(),
                  end: subscription.monthlyReset!,
                }),
                { format: ["months", "days", "hours"] }
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
