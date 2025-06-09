-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PESALINK', 'CARD', 'APPLE_PAY', 'GPAY', 'CASHAPP', 'MPESA');

-- CreateEnum
CREATE TYPE "PaymentState" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'PESALINK';
ALTER TYPE "PaymentMethod" ADD VALUE 'APPLE_PAY';
ALTER TYPE "PaymentMethod" ADD VALUE 'GPAY';
ALTER TYPE "PaymentMethod" ADD VALUE 'CASHAPP';
