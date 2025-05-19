/*
  Warnings:

  - You are about to drop the column `analistaId` on the `Manutencao` table. All the data in the column will be lost.
  - Added the required column `supervisorId` to the `Manutencao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Manutencao" DROP CONSTRAINT "Manutencao_analistaId_fkey";

-- AlterTable
ALTER TABLE "Manutencao" DROP COLUMN "analistaId",
ADD COLUMN     "supervisorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
