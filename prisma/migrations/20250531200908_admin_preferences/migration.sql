-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'MPESA';

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL DEFAULT 'global_settings',
    "isCashOnDelivery" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
