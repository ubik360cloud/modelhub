# ModelHub — Esquema de Base de Datos (Supabase)

Versión: 1.0 | Migración base: 001

---

## Tablas

### `profiles`
Extiende `auth.users` de Supabase. Una fila por cada usuario registrado.

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('admin', 'model', 'studio')),
  display_name    TEXT NOT NULL,
  avatar_url      TEXT,
  phone           TEXT,
  country         TEXT DEFAULT 'CO',
  plan            TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium')),
  plan_started_at TIMESTAMPTZ,
  plan_ends_at    TIMESTAMPTZ,
  stripe_customer_id TEXT,
  onboarding_done BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Notas:**
- `role` determina qué panel ve el usuario al entrar
- `plan` solo aplica a modelos (studios = free siempre, admin = acceso total)
- `onboarding_done` = false redirige al flujo de onboarding tras primer login

---

### `studios`
Una fila por cada estudio registrado.

```sql
CREATE TABLE studios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL, -- para URLs amigables
  address         TEXT,
  city            TEXT DEFAULT 'Medellín',
  phone           TEXT,
  website         TEXT,
  description     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `rooms`
Salas dentro de un estudio.

```sql
CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id   UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,        -- ej: "Sala 1", "Sala Diamante"
  description TEXT,
  capacity    INT DEFAULT 1,        -- modelos simultáneas (usualmente 1)
  equipment   TEXT,                 -- descripción libre del equipamiento
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `studio_models`
Vinculación entre estudios y modelos. Una modelo puede estar en un solo estudio activo.

```sql
CREATE TABLE studio_models (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id   UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  model_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  notes       TEXT,
  UNIQUE(studio_id, model_id)
);
```

**Notas:**
- `pending` = invitación enviada, modelo no ha aceptado aún (Fase 2)
- Una modelo puede estar en múltiples estudios pero solo 1 activo por diseño de negocio

---

### `shifts`
Turnos asignados por el estudio a una modelo en una sala.

```sql
CREATE TABLE shifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  model_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_id         UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  status          TEXT DEFAULT 'scheduled' CHECK (status IN (
                    'scheduled',    -- asignado por studio, pendiente confirmación
                    'confirmed',    -- modelo confirmó (o aceptó tácitamente)
                    'change_requested', -- modelo solicitó cambio
                    'cancelled',    -- cancelado por cualquier parte
                    'completed'     -- turno terminado
                  )),
  notes           TEXT,             -- nota del coordinador al asignar
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `shift_change_requests`
Solicitudes de cambio de turno iniciadas por la modelo.

```sql
CREATE TABLE shift_change_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id        UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  model_id        UUID NOT NULL REFERENCES profiles(id),
  type            TEXT NOT NULL CHECK (type IN (
                    'cancel',         -- no puede asistir
                    'extend',         -- quiere más horas
                    'reschedule'      -- quiere cambiar horario
                  )),
  requested_start TIMESTAMPTZ,      -- nueva hora solicitada (para reschedule/extend)
  requested_end   TIMESTAMPTZ,
  model_note      TEXT,             -- mensaje de la modelo
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  coordinator_note TEXT,            -- respuesta del coordinador
  resolved_at     TIMESTAMPTZ,
  resolved_by     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `notifications`
Sistema de notificaciones in-app (tiempo real via Supabase Realtime).

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,        -- 'shift_assigned', 'change_approved', 'change_rejected', 'forum_reply', etc.
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB,               -- payload adicional (ej: shift_id, post_id)
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `model_platforms`
Plataformas donde trabaja activamente una modelo.

```sql
CREATE TABLE model_platforms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,     -- 'Chaturbate', 'OnlyFans', etc.
  username      TEXT,              -- nombre de usuario en esa plataforma (opcional)
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(model_id, platform_name)
);
```

---

### `earnings`
Registro de ganancias por sesión o día.

```sql
CREATE TABLE earnings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  platform      TEXT NOT NULL,     -- nombre de la plataforma
  amount        NUMERIC(10,2) NOT NULL,
  currency      TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'COP')),
  notes         TEXT,
  source        TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'import')),
  import_batch  UUID,              -- para agrupar registros de una misma importación
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `earnings_imports`
Registro de cada importación de archivo.

```sql
CREATE TABLE earnings_imports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename      TEXT NOT NULL,
  rows_imported INT DEFAULT 0,
  rows_skipped  INT DEFAULT 0,     -- duplicados
  status        TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `goals`
Metas financieras personales de la modelo.

```sql
CREATE TABLE goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,           -- ej: "Mi apartamento"
  type            TEXT NOT NULL CHECK (type IN (
                    'housing', 'vehicle', 'travel', 'education', 'other'
                  )),
  target_amount   NUMERIC(14,2) NOT NULL,
  currency        TEXT DEFAULT 'COP' CHECK (currency IN ('COP', 'USD')),
  savings_pct     INT NOT NULL CHECK (savings_pct BETWEEN 10 AND 80), -- % de ganancias a destinar
  manual_income   NUMERIC(10,2),           -- ingreso mensual manual si no hay earnings
  current_saved   NUMERIC(14,2) DEFAULT 0, -- monto acumulado hacia esta meta
  is_completed    BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `tips`
Biblioteca de tips y consejos — editada por admin.

```sql
CREATE TABLE tips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL CHECK (category IN (
                'iluminacion', 'camara', 'engagement', 'bio',
                'thumbnail', 'tokens', 'mentalidad', 'general'
              )),
  content     TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `tip_menus`
Menús de propinas guardados por la modelo.

```sql
CREATE TABLE tip_menus (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,       -- ej: "Mi menú principal"
  content     TEXT NOT NULL,       -- texto formateado generado (con emojis, estructura)
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `forum_aliases`
Alias anónimo de cada modelo para el foro. Separado del perfil principal.

```sql
CREATE TABLE forum_aliases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id    UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  alias_name  TEXT NOT NULL UNIQUE,  -- nombre público en el foro
  avatar_color TEXT DEFAULT '#C9A96E', -- color del avatar generado
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Regla crítica:** Ninguna query pública del foro debe exponer `model_id`. Solo `alias_id`.

---

### `forum_posts`
Posts del foro comunitario.

```sql
CREATE TABLE forum_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_id    UUID NOT NULL REFERENCES forum_aliases(id) ON DELETE CASCADE,
  category    TEXT NOT NULL CHECK (category IN (
                'plataformas', 'ganancias', 'obs_tecnico',
                'bienestar', 'presentaciones', 'general'
              )),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,       -- max 500 chars (validado en frontend)
  upvotes     INT DEFAULT 0,
  is_solved   BOOLEAN DEFAULT FALSE,
  is_pinned   BOOLEAN DEFAULT FALSE,
  is_deleted  BOOLEAN DEFAULT FALSE, -- soft delete
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `forum_replies`
Respuestas a posts del foro.

```sql
CREATE TABLE forum_replies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  alias_id    UUID NOT NULL REFERENCES forum_aliases(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,       -- max 280 chars
  upvotes     INT DEFAULT 0,
  is_solution BOOLEAN DEFAULT FALSE, -- admin marca esta respuesta como solución
  is_deleted  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `forum_votes`
Upvotes en posts y respuestas (evita doble voto).

```sql
CREATE TABLE forum_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_id    UUID NOT NULL REFERENCES forum_aliases(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'reply')),
  target_id   UUID NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alias_id, target_type, target_id)
);
```

---

### `subscriptions`
Registro de suscripciones activas (Stripe).

```sql
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id    TEXT,
  plan                  TEXT NOT NULL CHECK (plan IN ('basic', 'premium')),
  status                TEXT NOT NULL CHECK (status IN (
                          'trialing', 'active', 'past_due', 'cancelled', 'incomplete'
                        )),
  trial_ends_at         TIMESTAMPTZ,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Row Level Security (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuario ve solo su perfil, admin ve todos
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_admin" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Earnings: modelo solo ve las suyas
CREATE POLICY "earnings_own" ON earnings
  FOR ALL USING (model_id = auth.uid());

-- Goals: modelo solo ve las suyas
CREATE POLICY "goals_own" ON goals
  FOR ALL USING (model_id = auth.uid());

-- Shifts: modelo ve los suyos, studio ve los de sus modelos
CREATE POLICY "shifts_model" ON shifts
  FOR SELECT USING (model_id = auth.uid());

CREATE POLICY "shifts_studio" ON shifts
  FOR ALL USING (
    studio_id IN (
      SELECT id FROM studios WHERE coordinator_id = auth.uid()
    )
  );

-- Notifications: cada usuario ve solo las suyas
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Tips: todos pueden leer, solo admin puede escribir
CREATE POLICY "tips_read" ON tips
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "tips_admin" ON tips
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Forum posts: solo modelos Premium pueden leer y escribir
-- CRÍTICO: nunca exponer model_id en queries públicas del foro
CREATE POLICY "forum_posts_premium" ON forum_posts
  FOR SELECT USING (
    is_deleted = FALSE AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'model'
      AND plan = 'premium'
    )
  );
```

---

## Datos semilla (seed)

```sql
-- Categorías de tips con contenido inicial
INSERT INTO tips (category, content, is_active) VALUES
('iluminacion', 'Usa luz de anillo frente a ti, nunca detrás. La luz posterior crea siluetas que reducen la calidad visual percibida por el cliente.', TRUE),
('iluminacion', 'Evita mezclar luz cálida y fría en la misma toma. Elige un solo tono (cálido 3200K o neutro 5500K) y sé consistente.', TRUE),
('iluminacion', 'Si no tienes ring light, una ventana grande con luz natural difusa es suficiente. Siéntate frente a ella, nunca de espaldas.', TRUE),
('camara', 'Posiciona la cámara ligeramente por encima de tu nivel de ojos para un ángulo más favorecedor.', TRUE),
('camara', 'Usa el modo retrato de tu celular o una cámara con lente de 35mm–50mm para obtener el mejor enfoque.', TRUE),
('engagement', 'Saluda a cada nuevo espectador por su nombre de usuario. Este simple gesto aumenta las propinas hasta un 40%.', TRUE),
('engagement', 'Crea objetivos de transmisión visibles (countdown de tokens) para crear urgencia y participación colectiva.', TRUE),
('engagement', 'Transmite en horarios fijos. Tus seguidores habituales se conectan cuando saben que estarás ahí.', TRUE),
('bio', 'Tu bio debe responder en 3 segundos: quién eres, qué ofreces, y por qué deberían quedarse. Sé específica.', TRUE),
('bio', 'Incluye al menos un dato personal no relacionado con el trabajo (tu música favorita, tu ciudad). Genera conexión.', TRUE),
('tokens', 'Define un menú de propinas claro y visible. Las metas ambiguas reciben menos tokens que las específicas.', TRUE),
('tokens', 'Ofrece recompensas escalonadas: 50 tokens, 100 tokens, 500 tokens. Cada nivel debe sentirse alcanzable.', TRUE),
('mentalidad', 'Toma descansos reales. Una modelo descansada transmite mejor energía y eso se traduce en más ingresos.', TRUE),
('mentalidad', 'Establece límites claros antes de empezar cada sesión. Saber qué harás y qué no te da confianza visible.', TRUE),
('general', 'Revisa tus ganancias semanalmente. Identificar qué días y horas generan más ingresos te permite optimizar tu horario.', TRUE),
('general', 'Diversifica en al menos 2 plataformas. Si una falla o te suspende temporalmente, tienes respaldo de ingresos.', TRUE),
('thumbnail', 'Tu foto de perfil es tu primer anuncio. Invierte tiempo en una buena imagen con buena iluminación y fondo limpio.', TRUE),
('obs_tecnico', 'Bitrate recomendado para 1080p: 4500–6000 kbps. Si tu internet es inestable, baja a 720p con 2500 kbps.', TRUE),
('obs_tecnico', 'Siempre usa conexión por cable (ethernet) para transmitir. El WiFi introduce micro-cortes que arruinan la calidad.', TRUE),
('engagement', 'Responde preguntas del chat aunque sean repetitivas. Los nuevos espectadores no saben que ya lo explicaste.', TRUE);

-- 3 plantillas de metas
-- (se insertan como ejemplos en el onboarding, no como metas reales de usuario)
```

---

## Índices recomendados

```sql
CREATE INDEX idx_shifts_model_id ON shifts(model_id);
CREATE INDEX idx_shifts_studio_id ON shifts(studio_id);
CREATE INDEX idx_shifts_starts_at ON shifts(starts_at);
CREATE INDEX idx_earnings_model_id ON earnings(model_id);
CREATE INDEX idx_earnings_date ON earnings(date);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, read);
CREATE INDEX idx_studio_models_model_id ON studio_models(model_id);
```

---

## Supabase Realtime

Habilitar para notificaciones in-app en tiempo real:

```sql
-- En Supabase Dashboard > Database > Replication
-- Habilitar realtime en:
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE shift_change_requests;
```

---

## Migraciones

| # | Archivo | Descripción |
|---|---|---|
| 001 | `001_initial_schema.sql` | Todas las tablas base |
| 002 | `002_rls_policies.sql` | Row Level Security |
| 003 | `003_indexes.sql` | Índices de rendimiento |
| 004 | `004_seed_tips.sql` | 20 tips iniciales |
| 005 | `005_realtime.sql` | Habilitar Realtime |
