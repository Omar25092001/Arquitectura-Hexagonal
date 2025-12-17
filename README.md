Este proyecto Plantea la base de un Digital Twin aplicando arquitectura hexagonal, las indicaciones de instalación del sistema son las siguientes:

Requisitos Previos
Docker y Docker Compose instalados.

Archivo .env configurado en la raíz con las credenciales de PostgreSQL.

Paso 1: Levantar los Servicios
Ejecuta el siguiente comando en la terminal para construir y levantar todos los contenedores en segundo plano:

Bash

docker-compose up -d --build
Esto iniciará:

Backend (Puerto 4000) - Ejecuta Prisma DB push y el servidor Node.

Frontend (Puerto 80) - Interfaz de usuario.

Postgres (Puerto 5432) - Base de datos.

Adminer (Puerto 8081) - Gestión visual de la BD.

Paso 2: Configuración de Algoritmos (ID de Usuario)
Debido a que los archivos .pkl de los modelos están vinculados a un ID de usuario específico, es necesario renombrarlos dentro del contenedor si tu ID de usuario es distinto al configurado por defecto.

1. Entrar al contenedor de Backend
Bash

docker exec -it mi-backend sh
2. Navegar a la carpeta de Modelos Predictivos
Bash

cd dist/infraestructura/ModelosML/Prediccion/ModelosPredictivos
3. Renombrar los archivos
Debes cambiar el prefijo 22d49a95-6272-4fa0-a290-5e625835e76d por tu UUID de usuario actual. Cabe destacar que para verificar el id de tu usuario o para crear un usuario como tal, debes ingresar al sistema con las credenciales de administrados:
correo: admin@gmail.com
contraseña: Admin25*

En la vista de administrador se podrá crear un usuario como tal, copiar el id de este y proceder al cambio de id en los algoritmos dentro de los contenedores de docker.

Puedes usar el comando mv:

Bash

# Ejemplo:
mv 22d49a95-6272-4fa0-a290-5e625835e76d__GradiantBoostingFinal_predictivo.pkl TU_NUEVO_ID__GradiantBoostingFinal_predictivo.pkl

mv 22d49a95-6272-4fa0-a290-5e625835e76d_modelo_1_predictivo.pkl TU_NUEVO_ID_modelo_1_predictivo.pkl
Nota: Asegúrate de mantener la estructura de guiones bajos tras el ID para que el script predictor.py pueda localizarlos correctamente.

Estructura de Rutas Clave
Si necesitas realizar ajustes adicionales dentro del contenedor, estas son las rutas importantes:

Raíz del proyecto: /app

Modelos ML: /app/dist/infraestructura/ModelosML

Prisma Schema: /app/infraestructura/backend/prisma/schema.prisma

Detener el Proyecto
Para apagar todos los servicios y limpiar los contenedores:

Bash

docker-compose down
Si deseas borrar también los datos de la base de datos:

Bash

docker-compose down -v


*El sistema ya implementa un Tutorial interactivo para su uso, por ende no se explica en este README.
