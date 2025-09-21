/*
  Warnings:

  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "alternativePhone" TEXT,
ADD COLUMN     "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Review_isApproved_idx" ON "Review"("isApproved");

-- CreateIndex
CREATE INDEX "Review_guestEmail_idx" ON "Review"("guestEmail");
