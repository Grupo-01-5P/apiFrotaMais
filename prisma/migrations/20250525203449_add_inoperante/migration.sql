-- CreateTable
CREATE TABLE "Inoperante" (
    "id" SERIAL NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "oficinaId" INTEGER NOT NULL,
    "responsavelId" INTEGER NOT NULL,

    CONSTRAINT "Inoperante_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inoperante" ADD CONSTRAINT "Inoperante_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inoperante" ADD CONSTRAINT "Inoperante_oficinaId_fkey" FOREIGN KEY ("oficinaId") REFERENCES "Oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inoperante" ADD CONSTRAINT "Inoperante_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
