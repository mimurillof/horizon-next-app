# 🔧 Corrección del Error de Registro

## Problema Identificado

Al registrarse, aparecía el error:
```
"Usuario creado en Auth pero falló el perfil: Error al crear perfil de usuario"
```

### Causa

El código intentaba crear el usuario en la tabla `users` **inmediatamente** después del registro en Supabase Auth, pero como Supabase requiere **confirmación de email primero**, la creación del perfil fallaba.

## Solución Implementada

### 1. Flujo Corregido

```
ANTES:
Registro → Crear en Auth → ❌ Intentar crear en tabla users → Error

AHORA:
Registro → Crear en Auth → Guardar datos temporalmente → Confirmar email → 
Login → Crear en tabla users → Tour
```

### 2. Cambios Realizados

#### **`/src/app/register/page.tsx`**
- ✅ Eliminado intento de crear usuario en tabla `users` durante el registro
- ✅ Datos del usuario se guardan temporalmente en `localStorage`
- ✅ Redirige directamente a `/confirm-email` sin errores

#### **`/src/app/page.tsx` (Login)**
- ✅ Mensaje más claro si el email no está confirmado
- ✅ Al hacer login después de confirmar email, verifica si el usuario existe en tabla `users`
- ✅ Si no existe, lo crea usando los datos de `localStorage`
- ✅ Limpia `localStorage` después de crear el usuario

#### **`/src/app/confirm-email/page.tsx`**
- ✅ Mensaje más claro con instrucciones paso a paso
- ✅ Énfasis en que debe confirmar el email antes de poder iniciar sesión
- ✅ Mejor diseño visual con alertas diferenciadas

## Nuevo Flujo Completo

### 📝 Paso 1: Registro
1. Usuario llena el formulario
2. Se crea cuenta en Supabase Auth
3. Datos se guardan temporalmente en navegador
4. **✅ Redirige a página de confirmación (sin error)**

### 📧 Paso 2: Confirmación de Email
1. Usuario ve mensaje claro de qué hacer
2. Revisa su email
3. Hace clic en enlace de confirmación
4. Email queda confirmado en Supabase

### 🔑 Paso 3: Primer Login
1. Usuario inicia sesión
2. Sistema verifica email confirmado ✓
3. Sistema busca usuario en tabla `users`
4. Si no existe → lo crea automáticamente
5. Redirige al tour de onboarding

### 🎯 Paso 4: Onboarding
1. Tour de bienvenida
2. Crear portafolio
3. Cuestionario de riesgo
4. Seleccionar assets
5. Guardar → Marca onboarding completo
6. Redirige a app web

### 🚀 Logins Subsecuentes
1. Usuario inicia sesión
2. Sistema detecta `has_completed_onboarding = true`
3. **Redirige directamente a app web**

## Mensajes al Usuario

### Durante Registro
```
✅ Sin errores visibles
→ Redirige a página de confirmación
```

### Página de Confirmación
```
🎉 ¡Cuenta Creada con Éxito!

📧 Te hemos enviado un enlace de confirmación

⚠️ Acción requerida:
1. Revisa tu bandeja de entrada
2. Haz clic en el enlace
3. Regresa e inicia sesión

ℹ️ Importante: No podrás iniciar sesión hasta confirmar
```

### Al Intentar Login Sin Confirmar
```
❌ Por favor confirma tu correo electrónico antes de iniciar sesión. 
   Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.
```

## Qué Hacer Ahora

### ✅ Probar el Flujo

1. **Registra un nuevo usuario:**
   ```
   http://localhost:3000/register
   ```
   - Verifica que NO aparezca el error
   - Verifica que redirige a `/confirm-email`

2. **Revisa el email y confirma:**
   - Haz clic en el enlace del email
   - Deberías ver una página de confirmación de Supabase

3. **Inicia sesión:**
   ```
   http://localhost:3000/
   ```
   - Debe crearse automáticamente en tabla `users`
   - Debe redirigir al tour

4. **Completa el onboarding:**
   - Pasa por el tour
   - Crea portafolio
   - Responde cuestionario
   - Agrega assets
   - Guarda

5. **Login de nuevo:**
   - Debe ir directamente a la app web

### 🐛 Si Algo Falla

**Error: "No se encontraron datos pendientes en localStorage"**
- **Causa:** El usuario limpió el navegador después de registrarse
- **Solución:** El usuario debe registrarse de nuevo

**No recibo email de confirmación:**
- Revisa carpeta de spam
- Verifica configuración SMTP en Supabase
- Revisa logs en Supabase Dashboard

**Usuario no se crea en tabla users:**
- Abre DevTools (F12) → Console
- Busca el log: "👤 Usuario no encontrado en tabla users, creando perfil..."
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada

## Verificación en Base de Datos

Después de que un usuario complete el registro y login:

```sql
-- Verificar que el usuario existe
SELECT * FROM users WHERE email = 'email@ejemplo.com';

-- Debe mostrar:
-- user_id | first_name | last_name | email | has_completed_onboarding
-- ...     | Miguel     | Murillo   | ...   | false
```

## Logs para Debugging

Abre DevTools (F12) y verás:

**Durante Registro:**
```
✅ Usuario registrado en Auth: [user_id]
📧 Datos guardados temporalmente. Redirigiendo...
```

**Durante Login:**
```
✅ Inicio de sesión exitoso
👤 Usuario no encontrado en tabla users, creando perfil...
✅ Usuario creado exitosamente
🎓 Usuario nuevo, redirigiendo al tour...
```

## Resumen

✅ **Error corregido:** Ya no aparece el mensaje de error durante el registro
✅ **Flujo mejorado:** El perfil se crea después de confirmar email
✅ **Mensajes claros:** El usuario sabe exactamente qué hacer
✅ **Recuperación automática:** Si falta el usuario en BD, se crea en el primer login
