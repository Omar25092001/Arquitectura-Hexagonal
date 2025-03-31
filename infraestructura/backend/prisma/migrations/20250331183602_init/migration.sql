-- CreateTable
CREATE TABLE "Clima" (
    "id" SERIAL NOT NULL,
    "ciudad" TEXT NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "humedad" DOUBLE PRECISION NOT NULL,
    "velocidadViento" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clima_pkey" PRIMARY KEY ("id")
);
