-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "contrasena" TEXT NOT NULL,
    "primeraVez" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejecucion_algoritmo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombreAlgoritmo" TEXT NOT NULL,
    "tipoAlgoritmo" TEXT NOT NULL,
    "valoresEntrada" TEXT NOT NULL,
    "variableSeleccionada" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "fechaEjecucion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tiempoEjecucion" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ejecucion_algoritmo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "ejecucion_algoritmo_usuarioId_fechaEjecucion_idx" ON "ejecucion_algoritmo"("usuarioId", "fechaEjecucion" DESC);

-- CreateIndex
CREATE INDEX "ejecucion_algoritmo_tipoAlgoritmo_idx" ON "ejecucion_algoritmo"("tipoAlgoritmo");

-- AddForeignKey
ALTER TABLE "ejecucion_algoritmo" ADD CONSTRAINT "ejecucion_algoritmo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
