/*
  Warnings:

  - You are about to drop the column `consumedCreditThisDay` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `consumedDailyCredit` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consumedMonthlyCredit` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "consumedCreditThisDay",
ADD COLUMN     "consumedDailyCredit" INTEGER NOT NULL,
ADD COLUMN     "consumedMonthlyCredit" INTEGER NOT NULL;
