# ===================================================================
# ETAPA 1: "builder" (Compila el código de Node.js)
# ===================================================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY infraestructura/backend/package.json .
COPY infraestructura/backend/package-lock.json .
RUN npm ci
COPY . .
RUN npx prisma generate --schema=./infraestructura/backend/prisma/schema.prisma
# Comando de build corregido para apuntar al tsconfig.json
RUN npx tsc -p ./infraestructura/backend/tsconfig.json --outDir ./dist

# ===================================================================
# ETAPA 2: "production" (Node.js + Python)
# ===================================================================
FROM node:20-alpine

WORKDIR /app

# --- Instalar Python y dependencias de ML ---
RUN apk add --no-cache python3 py3-pip build-base python3-dev
COPY infraestructura/ModelosML/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# --- Instalar dependencias de Node.js (solo producción) ---
COPY infraestructura/backend/package.json .
COPY infraestructura/backend/package-lock.json .
RUN npm ci --only=production

# --- Copiar código compilado y assets ---
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/infraestructura/backend/prisma ./infraestructura/backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/infraestructura/ModelosML/ ./infraestructura/ModelosML/
# Copia ModelosML TAMBIÉN a /app/dist/infraestructura/ModelosML/
COPY --from=builder /app/infraestructura/ModelosML/ ./dist/infraestructura/ModelosML/

# --- Configuración final ---
EXPOSE 3000

# Comando para iniciar tu servidor Node.js
CMD ["npm", "start"]