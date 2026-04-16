# MarkHub

Aplicación full stack para colaboración en Markdown: API en **Spring Boot** (`backend`) y cliente web en **React + Vite** (`frontend`).

## Requisitos

| Componente | Versión recomendada |
|------------|---------------------|
| Java       | 17                  |
| Maven      | 3.8+                |
| Node.js    | 18+ (LTS)           |
| PostgreSQL | 14+                 |
| Docker     | opcional, para levantar PostgreSQL en contenedor |

## Base de datos

El backend usa PostgreSQL y **Flyway** para las migraciones. Puedes usar **Docker** (recomendado para desarrollo rápido) o una instalación local de PostgreSQL.

### Con Docker

Usuario, contraseña y base `markhub` coinciden con los valores por defecto de `application.yml`. El ejemplo publica PostgreSQL en el **puerto 5433 del host** (`5433:5432`) para evitar choques con un PostgreSQL local en 5432.

**Contenedor único (`docker run`):**

```bash
docker run --name markhub-pg -e POSTGRES_USER=markhub -e POSTGRES_PASSWORD=markhub -e POSTGRES_DB=markhub -p 5433:5432 -d postgres:16
```

Arranca el backend indicando el puerto del host (el contenedor sigue escuchando en 5432 por dentro):

```bash
# Linux / macOS / Git Bash
export DATABASE_URL=jdbc:postgresql://localhost:5433/markhub

# PowerShell
$env:DATABASE_URL = "jdbc:postgresql://localhost:5433/markhub"
```
Para iniciar el docker:
```bash
docker start markhub-pg
```

Para detener y borrar el contenedor cuando ya no lo necesites:

```bash
docker stop markhub-pg
docker rm markhub-pg
```

**Con Docker Compose** (crea un archivo `docker-compose.db.yml` en la raíz o donde prefieras, con este contenido y ejecuta `docker compose -f docker-compose.db.yml up -d`):

```yaml
services:
  postgres:
    image: postgres:16
    container_name: markhub-pg
    environment:
      POSTGRES_USER: markhub
      POSTGRES_PASSWORD: markhub
      POSTGRES_DB: markhub
    ports:
      - "5433:5432"
    volumes:
      - markhub_pgdata:/var/lib/postgresql/data

volumes:
  markhub_pgdata:
```

Si mapeas **`5432:5432`**, no hace falta tocar `DATABASE_URL`: el valor por defecto del backend (`localhost:5432`) ya sirve.

### Instalación local (sin Docker)

Crea una base y un usuario que coincidan con la configuración (o ajusta las variables de entorno).

Ejemplo en `psql` como superusuario:

```sql
CREATE USER markhub WITH PASSWORD 'markhub';
CREATE DATABASE markhub OWNER markhub;
```

Valores por defecto en `backend/src/main/resources/application.yml`:

- URL: `jdbc:postgresql://localhost:5432/markhub`
- Usuario: `markhub`
- Contraseña: `markhub`

## Variables de entorno (backend)

Puedes omitirlas en desarrollo local; el proyecto define valores por defecto en `application.yml`.

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | JDBC URL de PostgreSQL |
| `DATABASE_USERNAME` | Usuario de la base de datos |
| `DATABASE_PASSWORD` | Contraseña de la base de datos |
| `SERVER_PORT` | Puerto del servidor (por defecto `8080`) |
| `JWT_SECRET` | Secreto para firmar JWT (en producción debe ser largo y aleatorio) |
| `JWT_EXPIRATION_MS` | Duración del token en milisegundos |
| `MARKHUB_ADMIN_USERNAME` | Usuario administrador inicial |
| `MARKHUB_ADMIN_PASSWORD` | Contraseña del administrador inicial |

En el primer arranque se crea un usuario admin si no existe. Por defecto: usuario `admin` y contraseña `password123` (cámbiala en entornos reales).

## Ejecución en desarrollo

### 1. Backend

Desde la raíz del repositorio:

```bash
cd backend
mvn spring-boot:run
```

La API queda en `http://localhost:8080`. Las rutas bajo `/api/**` requieren autenticación salvo `POST /api/auth/login`.

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite suele servir la app en `http://localhost:5173`. El CORS del backend está configurado para ese origen.

### URL del API (frontend)

El cliente usa la variable `VITE_API_URL`. En desarrollo ya está definida en `frontend/.env.development` como `http://localhost:8080`. Si cambias el puerto del backend, crea o edita `.env.development` (o `.env.local`) con:

```env
VITE_API_URL=http://localhost:PUERTO
```

## Scripts útiles (frontend)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint |

## Estructura del repositorio

- `backend` — Spring Boot 3, JPA, Security, JWT, Flyway
- `frontend` — React 18, TypeScript, Vite, Tailwind CSS
