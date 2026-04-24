# Quillay ERP

Sistema integral de gestión para Quillay SPA (construcción).

**Fase actual:** 1 — Fundaciones
**Stack:** Next.js 14 + Supabase + Tailwind + TypeScript
**Base de datos:** `jwxaxeakzjherdwldfqt.supabase.co` (ya configurada)

---

## 🚀 Instalación en Windows (primera vez)

### Requisitos previos

Debes tener instalado:
- ✅ [Node.js](https://nodejs.org/) v18+ (si tienes v24, mejor)
- ✅ [Git](https://git-scm.com/download/win) con PATH configurado
- ✅ [VS Code](https://code.visualstudio.com/)
- ✅ [GitHub Desktop](https://desktop.github.com/) (opcional)

Verificar que todo está instalado, abrir PowerShell:

```powershell
node --version   # debe responder v18.x o superior
git --version    # debe responder git version 2.xx
```

### Paso 1 — Clonar el repositorio

**Opción A — Con GitHub Desktop (más fácil):**
1. Abre GitHub Desktop
2. File → Clone repository → URL
3. Pega: `https://github.com/erpquillayspa-Max/QuillayERP.git`
4. Elige carpeta destino (ej: `C:\Users\mrodr\Documents\QuillayERP`)
5. Click "Clone"

**Opción B — Con PowerShell:**
```powershell
cd C:\Users\mrodr\Documents
git clone https://github.com/erpquillayspa-Max/QuillayERP.git
cd QuillayERP
```

### Paso 2 — Abrir en VS Code

Desde PowerShell dentro de la carpeta:
```powershell
code .
```
O click derecho en la carpeta → "Open with Code".

### Paso 3 — Configurar variables de entorno

1. En VS Code, copia el archivo `.env.local.example` y renómbralo a `.env.local`
2. Abre `.env.local` y pega el **SUPABASE_SERVICE_ROLE_KEY**:
   - Ve a https://supabase.com/dashboard/project/jwxaxeakzjherdwldfqt/settings/api
   - Copia la **`service_role` secret key** (NO la anon, la otra)
   - Pégala en el archivo reemplazando `aqui-pegas-la-service-role-key`
3. Guarda el archivo

**Importante:** `.env.local` está en `.gitignore`, nunca se subirá a GitHub.

### Paso 4 — Instalar dependencias

En PowerShell dentro de la carpeta del proyecto:
```powershell
npm install
```
Tarda 1-2 minutos la primera vez.

### Paso 5 — Correr el proyecto localmente

```powershell
npm run dev
```

Abre tu navegador en: http://localhost:3000

Deberías ver la landing page de Quillay.

### Paso 6 — Crear tu primer usuario (Super Admin)

Como es la primera vez, necesitas crear tu cuenta manualmente en Supabase:

1. Ve a https://supabase.com/dashboard/project/jwxaxeakzjherdwldfqt/auth/users
2. Click en **"Add user"** → **"Create new user"**
3. Email: `max@quillayspa.cl` (o el que prefieras)
4. Password: elige una segura y guárdala
5. Marca **"Auto confirm user"** (para saltar el email de verificación)
6. Click "Create user"
7. **Copia el ID del usuario creado** (aparece en la lista)

Ahora agrega el usuario a la tabla `usuarios`:

1. Ve a https://supabase.com/dashboard/project/jwxaxeakzjherdwldfqt/editor
2. Click en tabla `usuarios` → "Insert row"
3. Llena los campos:
   - `id`: pega el ID que copiaste
   - `email`: el mismo email
   - `nombre_completo`: `Maximiliano Rodríguez`
   - `rol`: `super_admin`
   - `empresa_id`: abre otra pestaña → tabla `empresas` → copia el ID de Quillay SPA
   - `puede_comprar`: marca ✓ (true)
   - `activo`: marca ✓ (true)
4. Click "Save"

Ahora prueba el login:
1. http://localhost:3000/login
2. Email + password del paso anterior
3. Debes entrar al dashboard

---

## 📦 Estructura del proyecto

```
QuillayERP/
├── src/
│   ├── app/                    # Páginas Next.js
│   │   ├── page.tsx            # Landing pública (quillayspa.cl futuro)
│   │   ├── login/              # Login
│   │   ├── (dashboard)/        # Área autenticada
│   │   │   ├── dashboard/      # Dashboard principal
│   │   │   └── admin/          # Administración
│   │   │       ├── empresa/
│   │   │       ├── usuarios/
│   │   │       ├── centros-costo/
│   │   │       └── parametros/
│   │   └── api/auth/logout/    # Endpoint cerrar sesión
│   ├── components/layout/      # Sidebar, Navbar
│   ├── lib/
│   │   ├── supabase/           # Clientes Supabase
│   │   └── utils/              # Formato RUT, CLP, fechas
│   ├── types/                  # Tipos TypeScript
│   └── middleware.ts           # Auth middleware
├── public/logo/                # Logo Quillay PNG
├── .env.local                  # TUS variables (NO subir a Git)
├── .env.local.example          # Plantilla
├── package.json
├── tailwind.config.ts          # Paleta Quillay
└── README.md
```

---

## 🛠️ Comandos útiles

```powershell
npm run dev       # Desarrollo local (puerto 3000)
npm run build     # Compilar para producción
npm start         # Correr versión compilada
npm run lint      # Revisar código
```

---

## 🔄 Workflow diario

### Hacer cambios al código

1. Abrir proyecto en VS Code
2. Editar archivos
3. Probar local con `npm run dev`
4. Commit y push:
   - **GitHub Desktop:** ver cambios → escribir mensaje → "Commit to main" → "Push origin"
   - **PowerShell:**
     ```powershell
     git add .
     git commit -m "Descripción del cambio"
     git push
     ```
5. Vercel detecta el push y despliega automáticamente

---

## 🚢 Deploy en Vercel (primera vez)

1. Ir a https://vercel.com/new
2. Click en **"Import Git Repository"**
3. Selecciona `QuillayERP`
4. Framework: Next.js (detectado automático)
5. En **Environment Variables**, agregar:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jwxaxeakzjherdwldfqt.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (pegar la anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (pegar la service role)
   - `NEXT_PUBLIC_APP_URL` = (tu URL .vercel.app, después la editas)
6. Click "Deploy"
7. En 1-2 minutos tienes tu URL `xxx.vercel.app`

---

## 📚 Módulos

### ✅ Fase 1 actual
- Autenticación con 6 roles
- Gestión básica de empresa
- Listado de usuarios
- Listado de centros de costo
- Parámetros legales chilenos
- Landing pública

### 🔜 Próximas fases
- Fase 2: Gastos + Dashboard CC
- Fase 3: Compras con IA
- Fase 4: Contratos + RRHH
- Fase 5: Asistencia + Vacaciones
- Fase 6: Liquidaciones + Nómina Santander + Previred
- Fase 7: Portal trabajador móvil
- Fase 8: OCs, Facturación, Retenciones
- Fase 9: Integración SII automática
- Fase 10: Inventario con IA
- Fase 11: Prevención de Riesgos
- Fase 12: Auditoría + Pulido

---

## 🔐 Seguridad

- `.env.local` nunca se sube a GitHub
- Row Level Security activo en todas las tablas
- Trabajadores solo ven sus datos
- Supervisores solo ven sus obras asignadas
- Contraseñas gestionadas por Supabase Auth

---

## 🆘 Si algo falla

- **Error `Module not found`:** corre `npm install` de nuevo
- **Error de login:** verifica que el usuario esté en ambas tablas (`auth.users` y `public.usuarios`)
- **Páginas en blanco:** revisa consola del navegador (F12) para ver errores
- **Variables de entorno:** después de editar `.env.local`, reinicia `npm run dev`

---

**Empresa:** Quillay SPA · RUT 76.402.512-1
**Representante:** Maximiliano Rodríguez Valencia
**Contacto:** contacto@quillayspa.cl
