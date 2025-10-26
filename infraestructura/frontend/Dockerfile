# ===================================================================
# ETAPA 1: "builder"
# Aquí compilamos la app de React/Vite
# ===================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia el package.json y lockfile
COPY package.json .
COPY package-lock.json .

# Instala dependencias
RUN npm ci

# Copia el resto del código fuente
COPY . .

# Compila la aplicación para producción (¡ESTA ES LA LÍNEA CORREGIDA!)
RUN npm run build

# ===================================================================
# ETAPA 2: "production"
# Usa un servidor web Nginx (muy ligero) para servir los archivos
# ===================================================================
FROM nginx:stable-alpine

# Copia los archivos estáticos compilados (de la carpeta 'dist')
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia tu propia configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80 (puerto web estándar)
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]