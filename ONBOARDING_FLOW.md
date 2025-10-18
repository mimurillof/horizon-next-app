# Flujo de Onboarding - Horizon Investment Hub

## Descripción General

Este documento explica el flujo completo de onboarding implementado para usuarios nuevos y existentes en la aplicación Horizon Investment Hub.

## Flujos de Usuario

### 🆕 Usuario Nuevo (Primera Vez)

```
1. Registro (/register)
   ↓
2. Confirmación de Email Requerida
   └─→ Email enviado con link de confirmación
   └─→ Pantalla de confirmación (/confirm-email)
   ↓
3. Usuario confirma email (clic en link)
   ↓
4. Login (/)
   └─→ Sistema verifica:
       ✓ Email confirmado
       ✗ has_completed_onboarding = false
   ↓
5. Redirige al Tour de Bienvenida (/portfolios)
   ↓
6. Tour Interactivo (3 tarjetas explicativas)
   ↓
7. Crear Portafolio (/portfolios/create)
   └─→ Nombre y descripción del portafolio
   ↓
8. Cuestionario de Riesgo (/portfolios/[id]/questions)
   └─→ Preguntas sobre:
       - Propósito de inversión
       - Horizonte temporal
       - Tolerancia al riesgo
   ↓
9. Selección de Assets (/portfolios/[id])
   └─→ Búsqueda y agregado de activos
   └─→ Fecha de adquisición
   └─→ Valor invertido
   ↓
10. Guardar Portafolio
    └─→ Sistema marca: has_completed_onboarding = true
    ↓
11. ✅ Redirige a App Web Principal
    └─→ https://mi-proyecto-topaz-omega.vercel.app/
```

### 👤 Usuario Existente (Ya Completó Onboarding)

```
1. Login (/)
   └─→ Sistema verifica:
       ✓ Email confirmado
       ✓ has_completed_onboarding = true
   ↓
2. ✅ Redirige DIRECTAMENTE a App Web Principal
   └─→ https://mi-proyecto-topaz-omega.vercel.app/
   └─→ Sin pasar por el tour
```

## Cambios Implementados

### 1. Base de Datos (schema.sql)
```sql
-- Agregado campo has_completed_onboarding a tabla users
has_completed_onboarding BOOLEAN DEFAULT FALSE
```

### 2. Páginas Nuevas

#### `/confirm-email`
- Informa al usuario que debe confirmar su email
- Contador de 10 segundos con redirección automática a login
- Opciones para ir al login o registrarse de nuevo

### 3. APIs Nuevas

#### `/api/complete-onboarding`
- **Método**: POST
- **Body**: `{ user_id: string }`
- **Función**: Marca `has_completed_onboarding = true`
- **Cuándo se llama**: Al guardar los assets del portafolio

### 4. Lógica de Registro Modificada (`/register`)

**Antes:**
```typescript
// Registro → Inmediatamente al tour
router.push('/portfolios');
```

**Ahora:**
```typescript
// Registro → Página de confirmación
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    emailRedirectTo: `${window.location.origin}/`,
    // ...
  },
});

router.push('/confirm-email'); // Espera confirmación
```

### 5. Lógica de Login Modificada (`/`)

**Antes:**
```typescript
// Login exitoso → Siempre a app web
window.location.href = 'https://mi-proyecto-topaz-omega.vercel.app/';
```

**Ahora:**
```typescript
// Login exitoso → Verificar estado
const { data: userData } = await supabase
  .from('users')
  .select('has_completed_onboarding')
  .eq('user_id', data.user.id)
  .single();

if (userData?.has_completed_onboarding) {
  // Usuario existente → App web
  window.location.href = 'https://mi-proyecto-topaz-omega.vercel.app/';
} else {
  // Usuario nuevo → Tour
  window.location.href = '/portfolios';
}
```

### 6. Guardado de Assets Modificado (`/portfolios/[id]`)

**Agregado al final del proceso:**
```typescript
// Marcar onboarding como completo
await fetch('/api/complete-onboarding', {
  method: 'POST',
  body: JSON.stringify({ user_id: currentUser.id }),
});

// Redirigir a app web
window.location.href = 'https://mi-proyecto-topaz-omega.vercel.app/';
```

## Configuración de Supabase Requerida

### Email Templates
En Supabase Dashboard → Authentication → Email Templates:

1. **Confirm signup** debe estar habilitado
2. El template debe incluir: `{{ .ConfirmationURL }}`
3. Redirect URL debe apuntar a: `https://tu-dominio.com/`

### URL Configuration
En Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://tu-dominio.com/`
- **Redirect URLs**: Agregar `https://tu-dominio.com/`

## Estados del Usuario

| Estado | email_confirmed_at | has_completed_onboarding | Redirección |
|--------|-------------------|--------------------------|-------------|
| Recién registrado | `null` | `false` | `/confirm-email` |
| Email confirmado, sin onboarding | `timestamp` | `false` | `/portfolios` (tour) |
| Onboarding completo | `timestamp` | `true` | App web externa |

## Verificación de Funcionamiento

### Para probar el flujo completo:

1. **Crear usuario nuevo**:
   ```
   - Ir a /register
   - Llenar formulario
   - Verificar que redirige a /confirm-email
   - Revisar email y confirmar
   ```

2. **Login por primera vez**:
   ```
   - Ir a /
   - Iniciar sesión
   - Verificar que redirige a /portfolios (tour)
   ```

3. **Completar onboarding**:
   ```
   - Pasar por las 3 tarjetas del tour
   - Crear portafolio
   - Responder cuestionario
   - Agregar assets
   - Guardar
   - Verificar que redirige a app web
   ```

4. **Login subsecuente**:
   ```
   - Cerrar sesión
   - Volver a iniciar sesión
   - Verificar que va DIRECTAMENTE a app web
   ```

## Troubleshooting

### Usuario no recibe email de confirmación
- Verificar configuración de SMTP en Supabase
- Revisar carpeta de spam
- Verificar que el email template está habilitado

### Usuario redirige al tour después de completar onboarding
- Verificar en base de datos que `has_completed_onboarding = true`
- Verificar que la API `/api/complete-onboarding` se está llamando correctamente
- Revisar logs del navegador

### Error al marcar onboarding como completo
- Verificar que `SUPABASE_SERVICE_ROLE_KEY` está configurada correctamente
- Verificar permisos RLS en la tabla `users`

## Logs para Debugging

El sistema incluye logging extensivo en consola:

```typescript
// En login
'✅ Inicio de sesión exitoso'
'📊 Estado de onboarding'
'🚀 Usuario existente, redirigiendo a app web...'
'🎓 Usuario nuevo, redirigiendo al tour...'

// En registro
'📧 Redirigiendo a página de confirmación de email...'

// En guardado de assets
'🎓 Marcando onboarding como completo...'
'✅ Onboarding completado'
'🚀 Redirigiendo a la app web...'
```

## Mantenimiento

### Migración de Usuarios Existentes

Si ya tienes usuarios en producción, ejecuta:

```sql
-- Marcar todos los usuarios existentes como onboarding completo
UPDATE users 
SET has_completed_onboarding = true 
WHERE created_at < NOW();
```

### Resetear Onboarding para Testing

```sql
-- Resetear onboarding de un usuario específico
UPDATE users 
SET has_completed_onboarding = false 
WHERE email = 'test@example.com';
```
