-- ModelHub Migration 004 — Seed Tips Library
-- Run this fourth, after 003_indexes.sql
-- These 20 tips are the initial content for the tips library.
-- Admin can add, edit, or deactivate them from the admin panel.

INSERT INTO tips (category, content, is_active) VALUES

-- ILUMINACIÓN
('iluminacion', 'Usa un aro de luz frente a ti, nunca detrás. La luz posterior crea siluetas que reducen la calidad visual percibida por el cliente.', TRUE),
('iluminacion', 'Evita mezclar luz cálida y fría en la misma toma. Elige un solo tono: cálido (3200K) o neutro (5500K) y sé consistente en todas tus transmisiones.', TRUE),
('iluminacion', 'Si no tienes aro de luz, una ventana grande con luz natural difusa es suficiente. Siéntate frente a ella, nunca de espaldas.', TRUE),

-- CÁMARA
('camara', 'Posiciona la cámara ligeramente por encima de tu nivel de ojos. Este ángulo es más favorecedor y da sensación de cercanía con el espectador.', TRUE),
('camara', 'Usa el modo retrato de tu celular o una cámara con lente de 35mm a 50mm para obtener el mejor enfoque con fondo difuminado.', TRUE),

-- ENGAGEMENT
('engagement', 'Saluda a cada nuevo espectador por su nombre de usuario. Este simple gesto puede aumentar las propinas hasta un 40% en una sesión.', TRUE),
('engagement', 'Crea objetivos de transmisión visibles (countdown de tokens) para generar urgencia y participación colectiva entre tus espectadores.', TRUE),
('engagement', 'Transmite en horarios fijos. Tus seguidores habituales se conectan cuando saben exactamente cuándo estarás en línea.', TRUE),
('engagement', 'Responde preguntas del chat aunque sean repetitivas. Los nuevos espectadores no saben que ya lo explicaste antes.', TRUE),

-- BIO
('bio', 'Tu bio debe responder en 3 segundos: quién eres, qué ofreces y por qué deberían quedarse. Sé específica y directa.', TRUE),
('bio', 'Incluye al menos un dato personal no relacionado con el trabajo, como tu música favorita o tu ciudad. Genera conexión emocional.', TRUE),

-- TOKENS
('tokens', 'Define un menú de propinas claro y visible en tu perfil. Las metas ambiguas reciben menos tokens que las específicas.', TRUE),
('tokens', 'Ofrece recompensas escalonadas: 50 tokens, 100 tokens, 500 tokens. Cada nivel debe sentirse alcanzable para motivar a más espectadores.', TRUE),

-- THUMBNAIL
('thumbnail', 'Tu foto de perfil es tu primer anuncio. Invierte tiempo en una imagen con buena iluminación, fondo limpio y expresión segura.', TRUE),

-- MENTALIDAD
('mentalidad', 'Toma descansos reales entre sesiones. Una modelo descansada transmite mejor energía y eso se traduce directamente en más ingresos.', TRUE),
('mentalidad', 'Establece tus límites antes de empezar cada sesión. Saber exactamente qué harás y qué no te da una confianza visible que los clientes notan.', TRUE),

-- GENERAL
('general', 'Revisa tus ganancias cada semana. Identificar qué días y horarios generan más ingresos te permite optimizar tu calendario de trabajo.', TRUE),
('general', 'Trabaja en al menos 2 plataformas simultáneamente. Si una falla o te suspende temporalmente, tienes respaldo de ingresos mientras resuelves.', TRUE),

-- OBS / TÉCNICO
('obs_tecnico', 'Bitrate recomendado para transmitir en 1080p: entre 4500 y 6000 kbps. Si tu internet es inestable, baja a 720p con 2500 kbps.', TRUE),
('obs_tecnico', 'Siempre usa conexión por cable (ethernet) para transmitir. El WiFi introduce micro-cortes que arruinan la calidad del stream y alejan espectadores.', TRUE);
