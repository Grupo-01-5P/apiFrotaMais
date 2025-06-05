/*
  Warnings:

  - Added the required column `updatedAt` to the `Inoperante` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FaseInoperante" AS ENUM ('FASE1', 'FASE2', 'FASE3', 'FASE4');

-- AlterTable
ALTER TABLE "Inoperante" ADD COLUMN     "faseAtual" "FaseInoperante" NOT NULL DEFAULT 'FASE1',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
