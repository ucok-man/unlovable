/*
  Warnings:

  - You are about to drop the column `consumedDailyCredit` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `consumedMonthlyCredit` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `dailyCreditConsumed` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "consumedDailyCredit",
DROP COLUMN "consumedMonthlyCredit",
ADD COLUMN     "dailyCreditConsumed" INTEGER NOT NULL,
ADD COLUMN     "monthlyCreditConsumed" INTEGER;
