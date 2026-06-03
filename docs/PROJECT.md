# ModelHub — Documento Maestro del Proyecto

**Dominio:** modelhub.studio (marketing) · app.modelhub.studio (plataforma)
**Propietarios:** Jose Villegas (Ubik360) + Socio/a
**Estado:** Beta privada — 10 modelos + 2 estudios
**Idioma:** Español (inglés en Fase 2)
**Repositorio:** GitHub (a crear: ubik360cloud/modelhub, rama main)

---

## Descripción del producto

ModelHub es una plataforma web mobile-first para modelos webcam independientes y estudios en Colombia. Resuelve tres problemas críticos documentados en la industria:

1. **Las modelos no saben cuánto ganan** — ni por plataforma, ni en total
2. **La coordinación de turnos es un caos** — estudios usan WhatsApp y Excel
3. **No existe comunidad ni formación** — las modelos aprenden solas o no aprenden

ModelHub no compite con Chaturbate, OnlyFans ni LiveJasmin. Compite con la desorganización, la opacidad financiera y la dependencia del estudio.

---

## URLs y servicios

| Servicio | URL / Referencia |
|---|---|
| Marketing site | https://modelhub.studio (Vercel) |
| App | https://app.modelhub.studio (Vercel) |
| Backend / API | https://api.modelhub.studio (DigitalOcean App Platform) |
| Supabase | (crear proyecto: modelhub-prod) |
| GitHub | ubik360cloud/modelhub (rama: main, auto-deploy) |

---

## Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend App | React 18 + Vite + Tailwind CSS | app.modelhub.studio |
| Marketing Site | React 18 + Vite + Tailwind CSS | modelhub.studio — misma repo, carpeta /marketing |
| Backend | Node 20 + Express | DigitalOcean App Platform |
| Base de datos | Supabase (PostgreSQL) | Auth + DB + Storage |
| Almacenamiento | Supabase Storage | Avatares, archivos importados |
| Pagos | Stripe | Suscripciones modelos ($20 y $35/mo) |
| Email transaccional | Resend | hello@modelhub.studio |
| Routing | React Router v6 | |
| Charts | Recharts | Dashboard de ganancias |
| Rich text | TipTap | Foro (plan Premium) |
| Estado global | Zustand | |
| Iconos | Lucide React | |

---

## Roles de usuario

| Rol | Descripción | Acceso |
|---|---|---|
| `admin` | Propietarios de ModelHub (Jose + socio/a) | Panel admin completo |
| `model` | Modelo webcam registrada | App completa según plan |
| `studio` | Coordinador de estudio | Solo módulo de programación |

---

## Planes y precios

### Plan Básico — $20 USD/mes (1er mes gratis)
- Dashboard de ganancias (entrada manual + importación CSV/Excel)
- Mis Metas (calculadora de objetivos personales)
- Programación de turnos (ver su horario asignado)
- Solicitar cambios de turno al estudio
- Perfil personal

### Plan Premium — $35 USD/mes
- Todo lo del plan Básico
- Generador de tips y contenido
- Constructor de menú de propinas
- Foro comunitario (alias anónimo)
- Biblioteca de tips editable por admin

### Estudios — GRATIS (Beta)
- Solo módulo de programación
- Configurar estudio (nombre, dirección, contacto, salas, modelos)
- Asignar turnos a modelos
- Aprobar/rechazar solicitudes de cambio de modelos
- Un usuario coordinador por estudio (Beta)

---

## Módulos — Fase 1 (MVP Beta)

### Orden de construcción

1. **Setup del proyecto** — estructura, Supabase schema completo, variables de entorno
2. **Auth** — registro, login, recuperación de contraseña, onboarding por rol
3. **Sistema de diseño** — componentes base, paleta, tipografía, glassmorphism cards
4. **Dashboard modelo** — cards resumen, navegación, estructura
5. **Ganancias** — log manual + importación CSV, tabla, gráfica mensual
6. **Mis Metas** — calculadora de objetivos personales
7. **Módulo de programación** — vista modelo (ver turno) + vista estudio (asignar/aprobar)
8. **Perfil** — datos personales, plataformas activas, avatar
9. **Generador de tips** (Premium) — biblioteca, constructor de menú
10. **Foro comunitario** (Premium) — posts con alias, respuestas, categorías
11. **Panel admin** — gestión de usuarios, contenido de tips, métricas
12. **Marketing site** — modelhub.studio landing page

---

## Módulo de programación — detalle

Este es el diferenciador más fuerte del producto para estudios.

### Flujo estudio → modelo
1. Coordinador entra a su panel de estudio
2. Configura salas disponibles (nombre, capacidad, equipamiento)
3. Asigna modelo a sala + fecha + hora inicio + hora fin
4. Modelo ve el turno asignado en su app (in-app, tiempo real via Supabase Realtime)
5. Modelo puede aceptar tácitamente (no hace nada) o solicitar cambio

### Flujo modelo → estudio
1. Modelo ve su turno en app
2. Toca "Solicitar cambio" → selecciona tipo: Más horas / Cancelar turno / Cambiar horario
3. Agrega nota opcional (texto libre)
4. Coordinador recibe notificación in-app
5. Coordinador aprueba o rechaza con nota
6. Modelo recibe respuesta in-app

### Entidades del estudio
- Nombre del estudio
- Dirección
- Teléfono de contacto
- Sitio web (opcional)
- Salas: nombre, descripción, capacidad simultánea, activa/inactiva
- Modelos vinculadas: lista de modelos que trabajan en ese estudio

### WhatsApp (Fase 2)
Notificaciones push vía WhatsApp Business API cuando se asigna turno o se aprueba/rechaza solicitud.

---

## Módulo Mis Metas — detalle

La modelo define objetivos personales financieros:

**Campos por meta:**
- Nombre del objetivo (ej: "Mi apartamento")
- Tipo: Vivienda / Vehículo / Viaje / Educación / Otro
- Valor total en COP o USD (seleccionable)
- Porcentaje de ganancias a destinar (slider: 10%–80%)
- Fecha de inicio (automática: hoy)

**Cálculo automático:**
- Conecta con el promedio mensual de ganancias registradas en el módulo de Ganancias
- Si no hay ganancias registradas: campo manual "¿Cuánto ganas al mes en promedio?"
- Calcula: meses necesarios = valor_meta / (ingreso_mensual × porcentaje_ahorro)
- Muestra: barra de progreso, fecha estimada de cumplimiento, ahorro mensual requerido
- Actualiza automáticamente cuando la modelo registra nuevas ganancias

**Múltiples metas simultáneas** — cada una con su barra de progreso independiente.

---

## Módulo de Ganancias — detalle

### Entrada manual
- Fecha, plataforma, monto (COP o USD), notas opcionales
- Lista de plataformas predefinidas: Chaturbate, BongaCams, LiveJasmin, OnlyFans, Streamate, Stripchat + "Otra"

### Importación CSV/Excel
- Modelo sube archivo
- App detecta columnas: fecha, plataforma, monto
- Preview antes de confirmar importación
- Manejo de duplicados (alerta si fecha+plataforma+monto ya existe)

### Vista de datos
- Tabla con filtro por fecha y plataforma
- Gráfica de barras mensual (Recharts)
- Totales: este mes, mes anterior, acumulado anual
- Desglose por plataforma (pie chart opcional)

---

## Foro comunitario — detalle

Solo para modelos con plan Premium ($35/mo).

- Cada modelo crea un **alias** al activar Premium (nombre + avatar de letra generado)
- El alias NO puede vincularse a su nombre real en ninguna vista pública
- Categorías: Plataformas / Ganancias / OBS y técnico / Bienestar / Presentaciones / General
- Posts: título + cuerpo (TipTap, máx 500 caracteres en el post inicial)
- Respuestas: máx 280 caracteres (estilo X/Twitter)
- Threads: respuestas anidadas a 1 nivel (no sub-respuestas de sub-respuestas)
- Upvotes en posts y respuestas
- Tag "Resuelto" — solo admin puede marcarlo
- Búsqueda por palabra clave
- Admin puede moderar, fijar y eliminar posts

---

## Panel admin — detalle

Acceso exclusivo para rol `admin` en /admin.

- **Usuarios:** lista de modelos y estudios, cambiar plan, activar/desactivar cuenta
- **Tips:** agregar, editar, eliminar tips de la biblioteca (categoría, texto, activo/inactivo)
- **Foro:** moderar posts, marcar resuelto, fijar posts, eliminar
- **Métricas:** total usuarios activos, suscriptores por plan, nuevos registros este mes
- **Estudios:** ver estudios registrados, salas configuradas, modelos vinculadas

---

## Diseño — sistema visual

| Token | Valor |
|---|---|
| Background | #0D0D0D / #111118 |
| Accent gold | #C9A96E |
| Accent rose | #E8B4B8 |
| Text primary | #F5F0E8 |
| Text muted | #6B7280 |
| Card border | rgba(255,255,255,0.08) |
| Heading font | Playfair Display (Google Fonts) |
| Body font | DM Sans (Google Fonts) |
| Card style | Glassmorphism — backdrop-blur, borde sutil |
| Botones | Outlined gold en dark, filled gold en hover |
| Iconos | Lucide React (outline) |
| Animaciones | Fade-in en cards, transiciones suaves en tabs |

**Reglas:**
- Sin emojis en la UI (sí en contenido generado por usuario)
- Todo en minúsculas de oración (sentence case)
- Sin gradientes pesados ni neon
- Mobile-first: navbar colapsa a tab bar inferior en móvil

---

## Estructura de carpetas (GitHub)

```
modelhub/
├── app/                          # React app (app.modelhub.studio)
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Páginas por módulo
│   │   ├── store/                # Zustand stores
│   │   ├── hooks/                # Custom hooks
│   │   ├── lib/                  # supabase.js, stripe.js, utils
│   │   └── styles/               # globals.css, design tokens
│   ├── public/
│   ├── index.html
│   └── vite.config.js
├── marketing/                    # Landing page (modelhub.studio)
│   ├── src/
│   └── vite.config.js
├── backend/                      # Node/Express API (api.modelhub.studio)
│   ├── routes/
│   ├── middleware/
│   └── index.js
├── supabase/
│   └── migrations/               # SQL migrations numeradas 001, 002...
└── docs/
    ├── PROJECT.md                # Este archivo
    ├── SCHEMA.md                 # Esquema completo de base de datos
    ├── MONETIZATION.md           # Lógica de planes y Stripe
    └── BUILD_PROMPT.md           # Prompt de construcción para VS Code
```

---

## Variables de entorno

### App (Vercel)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=https://api.modelhub.studio
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_ADMIN_PASSWORD=
```

### Backend (DigitalOcean)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
ADMIN_API_KEY=
FRONTEND_URL=https://app.modelhub.studio
CORS_ORIGINS=https://app.modelhub.studio,https://modelhub.studio
NODE_ENV=production
PORT=8080
```

---

## Estado actual

### Beta (en construcción)
- [ ] Repositorio GitHub creado
- [ ] Proyecto Supabase creado
- [ ] Schema de base de datos aplicado
- [ ] Auth funcionando (registro/login/roles)
- [ ] Dashboard básico
- [ ] Módulo de ganancias
- [ ] Mis Metas
- [ ] Módulo de programación
- [ ] Panel de estudio
- [ ] Plan Básico con Stripe ($20/mo)
- [ ] Plan Premium con Stripe ($35/mo)
- [ ] Generador de tips
- [ ] Foro comunitario
- [ ] Panel admin
- [ ] Marketing site (modelhub.studio)

### Beta pendiente (Fase 2)
- [ ] Notificaciones WhatsApp (turnos y cambios)
- [ ] Multi-coordinador por estudio
- [ ] Regalos directos de fans
- [ ] Integración NeumWebApp (si se obtiene acceso API)
- [ ] Versión inglés

---

## Notas de negocio

- Los estudios usan la plataforma **gratis** en Beta — son el canal de adquisición de modelos
- El modelo paga el plan básico ($20) o premium ($35) directamente
- El estudio "sugiere" ModelHub a sus modelos porque les resuelve el problema de coordinación
- La confidencialidad del alias en el foro es un requisito no negociable
- NeumWebApp es el ERP más común en estudios colombianos — investigar API futura
