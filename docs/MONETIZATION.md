# ModelHub — Monetización y Stripe

---

## Planes

| Plan | Precio | Trial | Stripe Price ID (crear) |
|---|---|---|---|
| Básico | $20 USD/mes | 30 días gratis | `price_basic_monthly` |
| Premium | $35 USD/mes | 30 días gratis | `price_premium_monthly` |
| Studio | $0 (Beta) | — | N/A |

---

## Feature gates por plan

| Funcionalidad | Free (no registrado) | Básico $20 | Premium $35 | Studio | Admin |
|---|---|---|---|---|---|
| Ver landing modelhub.studio | ✅ | ✅ | ✅ | ✅ | ✅ |
| Registrarse | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard de ganancias | ❌ | ✅ | ✅ | ❌ | ✅ |
| Importar CSV/Excel | ❌ | ✅ | ✅ | ❌ | ✅ |
| Mis Metas | ❌ | ✅ | ✅ | ❌ | ✅ |
| Ver turno asignado | ❌ | ✅ | ✅ | ❌ | ✅ |
| Solicitar cambio de turno | ❌ | ✅ | ✅ | ❌ | ✅ |
| Perfil y plataformas | ❌ | ✅ | ✅ | ❌ | ✅ |
| Generador de tips | ❌ | ❌ | ✅ | ❌ | ✅ |
| Constructor menú de propinas | ❌ | ❌ | ✅ | ❌ | ✅ |
| Foro comunitario | ❌ | ❌ | ✅ | ❌ | ✅ |
| Panel de programación estudio | ❌ | ❌ | ❌ | ✅ | ✅ |
| Panel admin completo | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Flujo de suscripción

### Registro modelo
1. Modelo se registra con email + contraseña
2. Selecciona plan (Básico o Premium)
3. Stripe Checkout abre (con 30 días de trial)
4. Stripe crea `subscription` con `status: trialing`
5. Backend recibe webhook `customer.subscription.created`
6. Se actualiza `profiles.plan` y se crea fila en `subscriptions`
7. Modelo entra al onboarding

### Webhook events a manejar
```
customer.subscription.created    → activar plan
customer.subscription.updated    → cambio de plan o renovación
customer.subscription.deleted    → cancelación → bajar a free
invoice.payment_succeeded        → renovación exitosa
invoice.payment_failed           → notificar modelo, marcar past_due
```

### Cancelación
- Modelo puede cancelar desde su perfil
- El acceso continúa hasta el fin del período pagado
- Al vencer: `plan = 'free'`, features bloqueadas

---

## Stripe — configuración inicial

### Productos a crear en Stripe Dashboard
```
Producto: "ModelHub Básico"
  Price: $20.00 USD / mes
  Trial: 30 días
  Metadata: plan=basic

Producto: "ModelHub Premium"  
  Price: $35.00 USD / mes
  Trial: 30 días
  Metadata: plan=premium
```

### Endpoint de webhook (backend)
```
POST /webhooks/stripe
Header: stripe-signature (verificar con STRIPE_WEBHOOK_SECRET)
```

---

## Lógica de upgrade/downgrade

- **Básico → Premium:** Stripe proration automática. Diferencia cobrada de inmediato.
- **Premium → Básico:** Efectivo al siguiente período. Acceso Premium hasta entonces.
- **Cualquier plan → cancelar:** Acceso hasta fin de período.

---

## Beta (modelos y estudios de prueba)

Para la beta con 10 modelos + 2 estudios:
- Crear cupón Stripe: `BETA2026` = 100% descuento por 3 meses
- Aplicar manualmente desde el dashboard de Stripe
- Studios: no requieren Stripe (plan gratuito permanente en Beta)
- Admin puede cambiar plan manualmente desde el panel admin via Supabase service role
