/*
  Warnings:

  - Made the column `dailyReset` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Subscription" ALTER COLUMN "dailyReset" SET NOT NULL,
ALTER COLUMN "monthlyCreditRemaining" DROP NOT NULL,
ALTER COLUMN "consumedMonthlyCredit" DROP NOT NULL;
