-- AlterTable
ALTER TABLE "Manutencao" ADD COLUMN     "dataAprovacao" TIMESTAMP(3),
ADD COLUMN     "dataReprovacao" TIMESTAMP(3),
ADD COLUMN     "motivoReprovacao" TEXT;
