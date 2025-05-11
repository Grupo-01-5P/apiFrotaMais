/*
  Warnings:

  - You are about to drop the column `localizacao` on the `Manutencao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Manutencao" DROP COLUMN "localizacao",
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
