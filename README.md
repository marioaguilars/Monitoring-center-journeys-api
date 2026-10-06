# Domapps Monitoring Center Backend

Backend encargado de mostrar alertas y auditorías, modificarlas y eliminarlas (lógico). Además, se encarga de proveer información a los tableros de Power BI. Todo bajo una restricción de rol de usuario.

## Herramientas utilizadas

- **Lenguaje de programación:** TypeScript
- **Base de datos:** MySQL 8.0+

## Estructura del proyecto

```
app
├─ package-lock.json
├─ package.json
├─ README.md
├─ src
│  ├─ config                     # Configuracion global y conexion a la base de datos (MySQL)
│  │  └─ db.ts
│  ├─ index.ts                   # Punto de entrada de la aplicacion (Inicializa Express y el servidor)
│  ├─ middlewares                # Middlewares globales de la aplicacion
│  │  └─ auth.middleware.ts      # Validacion general de JWT y roles de usuario
│  ├─ modules                    # Arquitectura por modulos funcionales del negocio
│  │  ├─ auth                    # Modulo de Autenticacion (Login, registro, etc.)
│  │  │  ├─ auth.controller.ts
│  │  │  └─ auth.routes.ts
│  │  ├─ forms                   # Modulo de Formularios
│  │  │  ├─ forms.controller.ts  # Controlador principal que orquesta las peticiones de formularios
│  │  │  ├─ forms.routes.ts      # Definicion de endpoints exclusivos para formularios
│  │  │  └─ services             # Carpeta de logica de negocio segmentada en servicios independientes
│  │  │     ├─ delete-form-record.ts
│  │  │     ├─ export-from-records-csv.ts
│  │  │     ├─ get-form-record-by-id.ts
│  │  │     ├─ get-form-records.ts
│  │  │     ├─ get-form-structure.ts
│  │  │     ├─ get-templates.ts
│  │  │     ├─ submit-form.ts
│  │  │     └─ update-form-record.ts
│  │  ├─ powerbi                 # Modulo para alimentar los tableros de Power BI
│  │  │  ├─ powerbi.controller.ts
│  │  │  └─ powerbi.routes.ts
│  │  └─ vehicles                # Modulo encargado de la gestion de vehiculos
│  │     ├─ vehicles.controller.ts
│  │     └─ vehicles.routes.ts
│  └─ routes                     # Enrutador maestro
│     └─ routes.ts               # Centraliza y conecta las rutas de todos los modulos anteriores
└─ tsconfig.json
```

## Variables de entorno

Para el funcionamiento del programa se requiere generar un archivo `.env` en la raíz del proyecto con la estructura utilizada en el archivo `.env.example`.

En este archivo podrás configurar:

- **Entorno de ejecución:** El puerto que utilizará el backend para dar el servicio.
- **Base de datos:** Configuración de la conexión a MySQL.
- **Seguridad:** El API Key para la verificación de la conexión y la palabra clave para cifrar los JWT.

## Instalación

### Clonar repositorio

```bash
git clone https://github.com/DOMApps-MX/domapps-monitoring-center-back.git
cd domapps-monitoring-center-back
```

### Instalar dependencias

```bash
npm install
```

## Ejecución

### Desarrollo

Para levantar el servidor de desarrollo con recarga automática:

```bash
npm run dev
```

### Producción

Para compilar y ejecutar el proyecto en un entorno de producción:

```bash
npm run build
npm run start
```
