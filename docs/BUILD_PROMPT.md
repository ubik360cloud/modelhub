# ModelHub — Prompt de Construcción para VS Code

Pega este prompt completo en el chat de Claude en VS Code para iniciar cada módulo.
Actualiza la sección "MÓDULO ACTUAL" antes de cada sesión.

---

## CONTEXTO DEL PROYECTO (incluir siempre)

Estoy construyendo **ModelHub** — una plataforma web mobile-first para modelos webcam independientes y estudios en Colombia.

**Stack:**
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node 20 + Express
- Base de datos: Supabase (PostgreSQL + Auth + Realtime)
- Payments: Stripe
- Email: Resend
- Charts: Recharts
- Rich text: TipTap
- Estado: Zustand
- Iconos: Lucide React
- Deploy: Vercel (frontend) + DigitalOcean App Platform (backend)

**URLs:**
- App: app.modelhub.studio
- Marketing: modelhub.studio
- API: api.modelhub.studio

**Roles de usuario:** `admin`, `model`, `studio`

**Planes:** Básico ($20/mes) · Premium ($35/mes) · Studio (gratis)

**Diseño — sistema visual:**
- Background: #0D0D0D / #111118
- Accent gold: #C9A96E
- Accent rose: #E8B4B8
- Text: #F5F0E8
- Cards: glassmorphism (backdrop-blur, border rgba(255,255,255,0.08))
- Heading font: Playfair Display
- Body font: DM Sans
- Botones: outlined gold en dark, filled gold en hover
- Iconos: Lucide React outline
- Mobile-first: nav colapsa a tab bar inferior en móvil
- Sin emojis en UI, todo en sentence case (minúsculas de oración)
- Sin gradientes pesados ni neon

**Reglas de código:**
- Siempre dame el archivo completo, nunca fragmentos parciales
- Usa variables de entorno para todas las keys (nunca hardcodeadas)
- Comenta en español
- Manejo de errores en todos los fetch/async
- Loading states en todos los componentes que hacen requests

---

## ESTRUCTURA DE CARPETAS

```
modelhub/
├── app/                          # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Button, Card, Input, Modal, Badge, etc.
│   │   │   ├── layout/           # Sidebar, TopBar, BottomTabBar, PageWrapper
│   │   │   └── [modulo]/         # Componentes específicos por módulo
│   │   ├── pages/
│   │   │   ├── auth/             # Login, Register, ForgotPassword, Onboarding
│   │   │   ├── dashboard/        # Dashboard principal
│   │   │   ├── earnings/         # Ganancias
│   │   │   ├── goals/            # Mis Metas
│   │   │   ├── schedule/         # Programación (modelo y studio)
│   │   │   ├── tips/             # Tips y generador (Premium)
│   │   │   ├── forum/            # Foro (Premium)
│   │   │   ├── profile/          # Perfil
│   │   │   └── admin/            # Panel admin
│   │   ├── store/                # Zustand: authStore, earningsStore, etc.
│   │   ├── hooks/                # useAuth, useSubscription, useNotifications
│   │   ├── lib/
│   │   │   ├── supabase.js       # Cliente Supabase
│   │   │   ├── stripe.js         # Helper Stripe
│   │   │   └── utils.js          # Formatters COP/USD, fechas, etc.
│   │   └── styles/
│   │       └── globals.css       # CSS variables, Tailwind base
│   ├── index.html
│   └── vite.config.js
├── marketing/                    # Landing page modelhub.studio
│   └── src/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── earnings.js
│   │   ├── goals.js
│   │   ├── schedule.js
│   │   ├── forum.js
│   │   ├── tips.js
│   │   ├── admin.js
│   │   └── webhooks.js           # Stripe webhooks
│   ├── middleware/
│   │   ├── auth.js               # Verificar JWT Supabase
│   │   └── subscription.js       # Verificar plan activo
│   └── index.js
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_indexes.sql
│       ├── 004_seed_tips.sql
│       └── 005_realtime.sql
└── docs/
    ├── PROJECT.md
    ├── SCHEMA.md
    ├── MONETIZATION.md
    └── BUILD_PROMPT.md
```

---

## MÓDULO ACTUAL

> ⚠️ CAMBIA ESTA SECCIÓN antes de cada sesión de trabajo

**Módulo:** [NOMBRE DEL MÓDULO]
**Paso:** [número] de 12
**Lo que ya está construido:** [lista lo que ya funciona]
**Lo que necesito ahora:** [descripción específica]

---

## PROMPTS POR MÓDULO

### PASO 1 — Setup del proyecto

```
Usando el contexto del proyecto arriba, crea la estructura completa del repositorio ModelHub.

Necesito:
1. package.json para /app con todas las dependencias (React 18, Vite, Tailwind, Supabase, Stripe, Recharts, TipTap, Zustand, Lucide React, React Router v6, DM Sans y Playfair Display via @fontsource)
2. vite.config.js para /app con proxy al backend en desarrollo
3. tailwind.config.js con los colores y fuentes del sistema de diseño
4. globals.css con CSS variables y Tailwind base
5. Los 5 archivos SQL de migraciones de Supabase (ver SCHEMA.md completo abajo)
6. .env.example para /app y /backend
7. vercel.json para el app con rewrites a api.modelhub.studio
8. package.json para /backend con Express, Supabase, Stripe, Resend, cors, dotenv

[PEGAR CONTENIDO COMPLETO DE SCHEMA.md AQUÍ]
```

---

### PASO 2 — Auth

```
El proyecto ya tiene la estructura base (paso 1 completo).

Construye el sistema de autenticación completo:

1. src/lib/supabase.js — cliente Supabase con tipos de base de datos
2. src/store/authStore.js — Zustand store con: user, profile, loading, signIn, signUp, signOut, fetchProfile
3. src/pages/auth/Login.jsx — página completa con diseño del sistema visual
4. src/pages/auth/Register.jsx — registro con selección de rol (modelo / estudio) y plan (básico / premium para modelos)
5. src/pages/auth/ForgotPassword.jsx
6. src/pages/auth/Onboarding.jsx — flujo diferente por rol:
   - Modelo: nombre display, plataformas activas, ingreso mensual aproximado
   - Studio: nombre del estudio, ciudad, dirección, teléfono, crear primera sala
7. src/hooks/useAuth.js — hook que expone el store de forma limpia
8. src/components/layout/ProtectedRoute.jsx — redirige si no autenticado, verifica rol
9. backend/middleware/auth.js — verifica JWT de Supabase en requests al backend
10. App.jsx con React Router v6 configurado con todas las rutas (públicas y protegidas)

Reglas:
- Después del registro → Onboarding si onboarding_done = false
- Después del login → Dashboard (modelo) o Panel de programación (studio)
- Admin → /admin
- Diseño: glassmorphism cards, fondo oscuro, accent gold, fuentes Playfair Display + DM Sans
```

---

### PASO 3 — Sistema de diseño

```
Auth está funcionando. Construye el sistema de componentes base:

1. src/components/ui/Button.jsx — variantes: primary (gold filled), secondary (outlined), ghost, danger. Sizes: sm, md, lg
2. src/components/ui/Card.jsx — glassmorphism: backdrop-blur, border rgba(255,255,255,0.08), fondo semi-transparente
3. src/components/ui/Input.jsx — con label, error state, helper text. Estilo oscuro
4. src/components/ui/Badge.jsx — para estados: activo/inactivo, planes, turnos
5. src/components/ui/Modal.jsx — overlay oscuro, card centrada, animación fade+scale
6. src/components/ui/PageWrapper.jsx — wrapper con padding consistente para cada página
7. src/components/layout/Sidebar.jsx — navegación lateral desktop, colapsa en móvil
8. src/components/layout/BottomTabBar.jsx — tab bar inferior para móvil (reemplaza sidebar)
9. src/components/layout/TopBar.jsx — header con nombre de usuario, notificaciones, avatar
10. src/components/layout/AppLayout.jsx — wrapper que combina Sidebar/BottomTabBar + TopBar + contenido

Los items de navegación dependen del rol:
- Modelo Básico: Dashboard, Ganancias, Mis Metas, Mi Turno, Perfil
- Modelo Premium: + Tips, Foro
- Studio: Solo Programación
- Admin: Usuarios, Tips, Foro, Métricas, Estudios
```

---

### PASO 4 — Dashboard modelo

```
Sistema de diseño completo. Construye el dashboard principal para modelos:

1. src/pages/dashboard/Dashboard.jsx — página principal
   - Card: Ganancias este mes (total + desglose por plataforma top 3)
   - Card: Próximo turno (si tiene studio vinculado)
   - Card: Meta activa más próxima a cumplirse (barra de progreso)
   - Card: Notificaciones recientes (últimas 3)
   - Accesos rápidos a todos los módulos según plan
   - Si plan = free o trial vencido: banner de upgrade

2. src/components/dashboard/EarningsSummaryCard.jsx
3. src/components/dashboard/NextShiftCard.jsx
4. src/components/dashboard/GoalProgressCard.jsx
5. src/components/dashboard/NotificationsDropdown.jsx — campana con badge de no leídas

Datos: todos desde Supabase directamente (no backend) usando el cliente JS.
```

---

### PASO 5 — Ganancias

```
Dashboard completo. Construye el módulo de ganancias:

1. src/pages/earnings/Earnings.jsx — página principal con tabs: "Registrar" | "Historial" | "Gráficas"
2. src/pages/earnings/EarningsForm.jsx — formulario entrada manual:
   - Fecha (date picker)
   - Plataforma (select: Chaturbate, BongaCams, LiveJasmin, OnlyFans, Streamate, Stripchat, Otra)
   - Si "Otra": campo de texto libre
   - Monto
   - Moneda (USD / COP)
   - Notas (opcional)
3. src/pages/earnings/EarningsImport.jsx — importación CSV/Excel:
   - Upload de archivo (drag & drop + click)
   - Preview de las primeras 5 filas detectadas
   - Mapeo de columnas: cuál columna es fecha / plataforma / monto
   - Botón confirmar importación
   - Reporte: X registros importados, X duplicados ignorados
4. src/pages/earnings/EarningsTable.jsx — tabla con filtros fecha y plataforma, ordenable
5. src/pages/earnings/EarningsCharts.jsx — gráfica de barras mensual (Recharts) + totales
6. backend/routes/earnings.js — endpoint POST /earnings/import para procesar archivo
7. src/store/earningsStore.js — Zustand con cache de ganancias

Para el import: acepta .csv y .xlsx, usa la librería papaparse para CSV y xlsx (SheetJS) para Excel.
```

---

### PASO 6 — Mis Metas

```
Ganancias completo. Construye el módulo Mis Metas:

1. src/pages/goals/Goals.jsx — lista de metas activas + completadas
2. src/pages/goals/GoalForm.jsx — crear/editar meta:
   - Nombre
   - Tipo (Vivienda / Vehículo / Viaje / Educación / Otro) con iconos
   - Valor objetivo (número + selector COP/USD)
   - % de ganancias a destinar (slider 10%–80%)
   - Si no tiene ganancias registradas: campo "¿Cuánto ganas al mes en promedio?"
3. src/components/goals/GoalCard.jsx — card con:
   - Nombre y tipo con icono
   - Valor objetivo formateado (ej: $200.000.000 COP)
   - Barra de progreso % completado
   - Ahorro mensual requerido
   - Fecha estimada de cumplimiento
   - Meses restantes
4. src/lib/goalCalculator.js — lógica pura de cálculo:
   - Entrada: target_amount, currency, savings_pct, avg_monthly_income
   - Salida: monthly_saving, months_to_complete, completion_date
   - Convierte COP/USD usando tasa fija configurable (para Beta: 1 USD = 4100 COP)

La fecha estimada se recalcula automáticamente cuando la modelo registra nuevas ganancias.
```

---

### PASO 7 — Módulo de programación

```
Metas completo. Construye el módulo de programación (el más complejo):

VISTA MODELO:
1. src/pages/schedule/ModelSchedule.jsx — vista semana actual + próxima semana
   - Listado de turnos: sala, fecha, hora inicio, hora fin, estado (badge)
   - Botón "Solicitar cambio" en cada turno
2. src/pages/schedule/ShiftChangeRequest.jsx — formulario de solicitud:
   - Tipo: Cancelar / Extender horas / Cambiar horario
   - Si Extender o Cambiar: pickers de nueva hora inicio/fin
   - Nota libre (textarea)
   - Enviar → crea fila en shift_change_requests + notificación al coordinador

VISTA STUDIO (rol studio):
3. src/pages/schedule/StudioSchedule.jsx — panel principal del coordinador
   - Vista de semana con todas las salas en columnas
   - Cada slot de tiempo muestra: nombre modelo, sala, horario
   - Indicador visual de salas ocupadas/libres
4. src/pages/schedule/AssignShift.jsx — formulario asignar turno:
   - Seleccionar modelo (dropdown de modelos vinculadas al estudio)
   - Seleccionar sala (dropdown de salas activas)
   - Fecha + hora inicio + hora fin
   - Nota opcional
   - Al guardar → crea fila en shifts + notificación in-app a la modelo
5. src/pages/schedule/StudioSetup.jsx — configuración del estudio (onboarding de studio):
   - Nombre, ciudad, dirección, teléfono, web
   - Gestión de salas: agregar, editar, activar/desactivar
   - Gestión de modelos vinculadas: agregar por email
6. src/pages/schedule/ChangeRequests.jsx — bandeja de solicitudes pendientes del coordinador:
   - Lista de solicitudes con: nombre modelo, turno afectado, tipo de solicitud, nota
   - Botones: Aprobar / Rechazar con campo de nota de respuesta
   - Al resolver → update shift_change_requests + notificación a modelo

NOTIFICACIONES REALTIME (Supabase Realtime):
7. src/hooks/useNotifications.js — suscripción a tabla notifications en tiempo real
   - Al recibir nueva notificación: mostrar toast + actualizar badge en TopBar
   - Marcar como leídas al abrir el dropdown

BACKEND:
8. backend/routes/schedule.js:
   - POST /schedule/shifts — crear turno (solo studio/admin)
   - PATCH /schedule/shifts/:id — actualizar estado
   - POST /schedule/shifts/:id/change-request — solicitud de modelo
   - PATCH /schedule/change-requests/:id — aprobar/rechazar (solo studio/admin)
   - Cada acción que cambia estado → insertar fila en notifications
```

---

### PASO 8 — Perfil

```
Programación completo. Construye el módulo de perfil:

1. src/pages/profile/Profile.jsx — página principal del perfil
2. src/pages/profile/EditProfile.jsx:
   - Nombre display
   - Teléfono
   - Avatar (upload a Supabase Storage, max 2MB, recorte cuadrado)
   - Plataformas activas: agregar/quitar con username opcional por plataforma
3. src/pages/profile/SubscriptionStatus.jsx:
   - Plan actual, fecha de próximo cobro
   - Botón "Cambiar plan" → Stripe Customer Portal
   - Botón "Cancelar suscripción"
4. backend/routes/auth.js:
   - POST /auth/create-portal-session — Stripe Customer Portal URL
   - POST /auth/create-checkout-session — nueva suscripción
```

---

### PASO 9 — Tips y generador (Premium)

```
Perfil completo. Construye el módulo de tips (solo plan Premium):

1. src/pages/tips/Tips.jsx — página principal con tabs: "Tips" | "Mi Menú"
2. src/pages/tips/TipsLibrary.jsx:
   - Grid de tips organizados por categoría (tabs o filtro)
   - Botón "Tip aleatorio" → muestra tip random de la biblioteca
   - Cada tip: card con categoría badge, texto, botón copiar
3. src/pages/tips/TipMenuBuilder.jsx — constructor de menú de propinas:
   - Modelo agrega servicios: nombre del servicio + precio en tokens
   - Botón "Generar menú" → Claude API genera texto formateado con estructura y emojis
   - Preview del menú generado
   - Botón copiar al portapapeles
   - Botón guardar menú (con nombre)
4. src/pages/tips/SavedMenus.jsx — lista de menús guardados, copiar/editar/eliminar
5. backend/routes/tips.js:
   - GET /tips — lista todos los tips activos (con caché)
   - POST /tips/generate-menu — llama Claude API para generar menú formateado
   
Para el generador de menú, el prompt a Claude debe ser:
"Eres un experto en marketing para plataformas de streaming adulto. Genera un menú de propinas profesional, atractivo y fácil de leer para una modelo webcam. Usa emojis decorativos, estructura clara con precios en tokens, y un tono seductor pero elegante. Los servicios son: [lista]. Responde SOLO con el texto del menú, sin explicaciones."
```

---

### PASO 10 — Foro comunitario (Premium)

```
Tips completo. Construye el foro comunitario (solo plan Premium):

1. src/pages/forum/Forum.jsx — página principal con categorías + posts recientes
2. src/pages/forum/ForumSetup.jsx — si modelo Premium no tiene alias aún: crear alias (nombre único)
3. src/pages/forum/CategoryView.jsx — lista de posts de una categoría, filtrable, ordenable (reciente/más votos)
4. src/pages/forum/PostDetail.jsx — post completo con respuestas anidadas, botón upvote
5. src/pages/forum/NewPost.jsx — formulario: categoría, título, cuerpo (TipTap, max 500 chars con contador)
6. src/components/forum/PostCard.jsx — card con alias avatar (color generado), título, preview, votos, replies count, badge resuelto/fijado
7. src/components/forum/ReplyForm.jsx — textarea max 280 chars con contador en tiempo real
8. src/components/forum/AliasAvatar.jsx — avatar circular con primera letra del alias + color

REGLAS CRÍTICAS:
- Nunca mostrar model_id en ninguna query o respuesta del foro
- Solo mostrar alias_name y avatar_color
- Admin puede ver alias pero nunca el nombre real en vistas del foro
- Búsqueda por keyword en títulos y cuerpos de posts
```

---

### PASO 11 — Panel admin

```
Foro completo. Construye el panel de administración:

1. src/pages/admin/AdminDashboard.jsx — métricas: total usuarios, por plan, nuevos este mes, estudios activos
2. src/pages/admin/AdminUsers.jsx — tabla de usuarios con: nombre, email, rol, plan, fecha registro, estado. Acciones: cambiar plan, activar/desactivar
3. src/pages/admin/AdminTips.jsx — CRUD completo de tips de la biblioteca: agregar, editar, activar/desactivar, reordenar por categoría
4. src/pages/admin/AdminForum.jsx — vista de todos los posts con acciones: fijar, marcar resuelto, eliminar
5. src/pages/admin/AdminStudios.jsx — lista de estudios: nombre, coordinador, salas, modelos vinculadas

Backend:
6. backend/routes/admin.js — todos los endpoints admin con middleware que verifica role = 'admin'
```

---

### PASO 12 — Marketing site

```
App completa. Construye la landing page modelhub.studio:

Es una página de marketing en español, mobile-first, mismo sistema de diseño que la app.

Secciones:
1. Hero — headline impactante, subheadline, CTA "Empieza gratis 30 días"
2. El problema — 3 columnas mostrando los problemas del mercado (desorganización, opacidad financiera, aislamiento)
3. La solución — los módulos principales con iconos y descripciones breves
4. Planes y precios — tabla comparativa Básico $20 / Premium $35 / Studio Gratis
5. Para estudios — sección separada explicando el módulo de programación
6. Testimonios — placeholder para 3 testimonios (Beta)
7. FAQ — 5 preguntas frecuentes con accordion
8. Footer — links, contacto, redes sociales

Ruta de deploy: carpeta /marketing en el mismo repo, Vercel project separado apuntando a modelhub.studio
```

---

## Notas para cada sesión

1. **Siempre pega el bloque de CONTEXTO DEL PROYECTO** al inicio
2. **Actualiza "Lo que ya está construido"** para que Claude no repita trabajo
3. **Pide archivos completos** — nunca fragmentos. Si Claude da un fragmento, dile: "Dame el archivo completo, desde la primera hasta la última línea"
4. **Para errores:** copia el error exacto de la consola + el archivo donde ocurre
5. **Para el backend en DigitalOcean:** siempre verifica las variables de entorno antes de hacer deploy
6. **Supabase migrations:** aplica en orden (001, 002...) desde el SQL Editor de Supabase
