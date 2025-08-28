/*
  Warnings:

  - You are about to drop the column `consumedCredit` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `remainingCredit` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `consumedCreditThisDay` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyCreditRemaining` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyCreditRemaining` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "consumedCredit",
DROP COLUMN "remainingCredit",
ADD COLUMN     "consumedCreditThisDay" INTEGER NOT NULL,
ADD COLUMN     "dailyCreditRemaining" INTEGER NOT NULL,
ADD COLUMN     "monthlyCreditRemaining" INTEGER NOT NULL;
