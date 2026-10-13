# BiblioUni

Sistema web de gestión de biblioteca desarrollado con React, TypeScript y Vite.

La aplicación permite consultar el catálogo, registrar libros y usuarios, administrar categorías, registrar préstamos y gestionar devoluciones. La información se conserva localmente en el navegador mediante `localStorage`.

## Requisitos

Antes de clonar el proyecto, instala los siguientes programas:

- **Git**: https://git-scm.com/downloads
- **Node.js** versión 20 o superior: https://nodejs.org/
- **Visual Studio Code**: https://code.visualstudio.com/ (recomendado)

Para comprobar que están instalados, abre PowerShell o una terminal y ejecuta:

```powershell
git --version
node --version
npm --version
```

## Clonar el repositorio

### 1. Abrir una terminal

En Windows puedes abrir cualquiera de estas opciones:

- PowerShell
- Símbolo del sistema
- Git Bash
- Terminal integrada de Visual Studio Code

### 2. Elegir la carpeta de destino

Por ejemplo, para trabajar dentro de `C:\Proyectos`:

```powershell
cd C:\Proyectos
```

Si la carpeta no existe, créala primero:

```powershell
mkdir C:\Proyectos
cd C:\Proyectos
```

### 3. Clonar la rama principal

Ejecuta:

```powershell
git clone -b main https://github.com/saulPariona/PROYECTO_PARCIAL-.git
```

Este comando crea una carpeta llamada `PROYECTO_PARCIAL-` y descarga el contenido de la rama `main`.

### 4. Entrar al proyecto

```powershell
cd PROYECTO_PARCIAL-
```

Puedes confirmar que estás en el repositorio correcto con:

```powershell
git remote -v
git branch --show-current
```

La rama actual debe ser:

```text
main
```

## Instalar las dependencias

Desde la carpeta raíz del proyecto, ejecuta:

```powershell
npm install
```

Este comando lee `package.json` y descarga todas las dependencias necesarias dentro de `node_modules`.

Las principales dependencias del proyecto son:

- React
- React DOM
- React Router DOM
- Lucide React
- TypeScript
- Vite
- Oxlint

La carpeta `node_modules` no se versiona en Git. Por eso es necesario ejecutar `npm install` después de clonar el repositorio.

## Ejecutar el proyecto en desarrollo

Para iniciar el servidor local:

```powershell
npm run dev
```

Vite mostrará una dirección similar a:

```text
Local: http://localhost:5173/
```

Abre esa dirección en el navegador.

También puedes iniciar Vite haciendo que sea accesible desde otros dispositivos de la red:

```powershell
npm run dev -- --host
```

Para detener el servidor, presiona:

```text
Ctrl + C
```

## Abrir el proyecto en Visual Studio Code

Después de clonar el repositorio:

```powershell
code .
```

Si el comando `code` no está disponible, abre Visual Studio Code manualmente y selecciona:

**File > Open Folder > PROYECTO_PARCIAL-**

Después abre una terminal integrada con:

**Terminal > New Terminal**

## Comandos disponibles

### Desarrollo

```powershell
npm run dev
```

Inicia Vite con recarga automática. Los cambios realizados en los archivos se reflejan en el navegador sin reiniciar manualmente el servidor.

### Compilación de producción

```powershell
npm run build
```

Este comando:

1. Comprueba el proyecto con TypeScript.
2. Genera la versión optimizada de producción con Vite.
3. Guarda el resultado en la carpeta `dist`.

### Verificación de errores de estilo

```powershell
npm run lint
```

Ejecuta Oxlint para detectar problemas en el código.

### Previsualización de producción

Después de ejecutar `npm run build`, puedes comprobar la versión compilada con:

```powershell
npm run preview
```

## Verificación completa después de clonar

Una vez instaladas las dependencias, ejecuta:

```powershell
npm run lint
npm run build
```

Si ambos comandos finalizan correctamente, el proyecto está listo para ejecutarse.

## Estructura principal

```text
PROYECTO_PARCIAL-/
├── public/                  # Archivos públicos e iconos
├── src/
│   ├── assets/              # Imágenes y recursos
│   ├── components/
│   │   ├── layout/          # Header y Sidebar
│   │   └── ui/              # Componentes reutilizables
│   ├── lib/
│   │   └── storage.ts       # Persistencia en localStorage
│   ├── pages/
│   │   ├── CategoriesPage.tsx
│   │   └── LibraryPages.tsx
│   ├── types/
│   │   └── library.ts       # Tipos Book, User y Loan
│   ├── App.tsx              # Estado principal y rutas
│   ├── App.css              # Estilos de la aplicación
│   ├── index.css            # Estilos globales
│   └── main.tsx             # Punto de entrada
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Funcionalidades

- Dashboard con resumen de la biblioteca.
- Catálogo de libros.
- Búsqueda de libros por título, autor o categoría.
- Registro, edición y eliminación de libros.
- Registro, edición y eliminación de usuarios.
- Creación, edición y eliminación de categorías.
- Registro de préstamos.
- Registro de devoluciones.
- Comprobantes de préstamos.
- Navegación mediante React Router.
- Persistencia de datos en `localStorage`.
- Diseño adaptable para diferentes tamaños de pantalla.

## Datos locales

Los datos de la aplicación se guardan en el navegador. No existe una base de datos externa.

La aplicación utiliza estas claves de `localStorage`:

- `biblio-books`
- `biblio-users`
- `biblio-loans`
- `biblio-categories`
- `users` como compatibilidad con datos anteriores

Para reiniciar los datos de prueba:

1. Abre la aplicación en el navegador.
2. Presiona `F12`.
3. Entra en **Application > Local Storage**.
4. Selecciona `http://localhost:5173`.
5. Elimina las claves `biblio-books`, `biblio-users`, `biblio-loans`, `biblio-categories` y `users`.
6. Recarga la página.

## Flujo de trabajo con Git

Antes de comenzar a trabajar:

```powershell
git checkout main
git pull origin main
```

Después de realizar cambios:

```powershell
git status
git add .
git commit -m "Describe el cambio realizado"
git push origin main
```

Para comprobar que no hay cambios pendientes:

```powershell
git status
```

El resultado esperado es:

```text
nothing to commit, working tree clean
```

## Errores comunes

### `npm` no se reconoce como comando

Node.js no está instalado o no se agregó al `PATH`.

Solución:

1. Instala Node.js desde https://nodejs.org/
2. Cierra y vuelve a abrir la terminal.
3. Ejecuta:

```powershell
node --version
npm --version
```

### `Cannot find module`

Normalmente significa que las dependencias no están instaladas.

Ejecuta:

```powershell
npm install
```

Si el problema continúa, elimina únicamente `node_modules` y vuelve a instalar:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### `useLocation() may be used only in the context of a <Router>`

La aplicación debe iniciarse desde `src/main.tsx`, donde `App` está envuelto en `BrowserRouter`. Si se modifica el punto de entrada, no se debe eliminar ese envoltorio.

### La página aparece en blanco

Revisa:

1. La consola del navegador con `F12`.
2. Que el servidor Vite esté activo.
3. Que hayas ejecutado `npm install`.
4. Que la URL sea `http://localhost:5173/`.
5. Que no existan errores al ejecutar:

```powershell
npm run build
```

### `nothing to commit, working tree clean`

No es un error. Significa que no hay cambios nuevos para crear otro commit.

Puedes comprobar el último commit con:

```powershell
git log -1 --oneline
```

## Tecnologías

- React 19
- TypeScript
- Vite
- React Router DOM
- Lucide React
- CSS
- Local Storage
- Oxlint

## Repositorio

Repositorio oficial:

https://github.com/saulPariona/PROYECTO_PARCIAL-

Rama principal:

```text
main
```
