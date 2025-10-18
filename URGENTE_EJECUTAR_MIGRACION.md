# ⚠️ ACCIÓN REQUERIDA: Agregar Columna a Base de Datos

## 🔴 Error Actual

```
Error al verificar el estado de tu cuenta: 
column users.has_completed_onboarding does not exist
```

## ✅ Solución: Ejecutar Script de Migración

La columna `has_completed_onboarding` **NO existe** en tu tabla `users`. Debes agregarla ejecutando un script SQL.

---

## 📝 PASO A PASO (5 minutos)

### 1️⃣ Abre Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: **Horizon**
3. En el menú lateral izquierdo, busca: **SQL Editor**

### 2️⃣ Crea una Nueva Query

1. Haz clic en: **+ New query** (botón verde arriba a la derecha)
2. Se abrirá un editor SQL vacío

### 3️⃣ Copia y Pega Este Script

```sql
-- Agregar columna has_completed_onboarding
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Verificar que se agregó correctamente
SELECT 
    user_id, 
    email, 
    has_completed_onboarding, 
    created_at 
FROM users 
LIMIT 5;
```

### 4️⃣ Ejecuta el Script

1. Haz clic en el botón **Run** (o presiona `Ctrl + Enter`)
2. Deberías ver un mensaje de éxito: ✅ **Success. No rows returned**
3. Luego verás una tabla con los usuarios (si existen)

### 5️⃣ Verifica que Funcionó

Ve a: **Table Editor** → Selecciona tabla **users**

Deberías ver la nueva columna: `has_completed_onboarding` con valor `false`

---

## 🎯 Después de Ejecutar el Script

1. **Refresca la página** de login en tu navegador
2. **Intenta hacer login de nuevo**
3. Ahora debería funcionar correctamente

---

## 🔍 Qué Hace Este Script

### Línea 1-2: Agregar la columna
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;
```
- Agrega la columna `has_completed_onboarding` 
- Tipo: BOOLEAN (verdadero/falso)
- Valor por defecto: FALSE (no ha completado onboarding)
- `IF NOT EXISTS`: No da error si ya existe

### Línea 4-9: Verificación
```sql
SELECT user_id, email, has_completed_onboarding, created_at 
FROM users 
LIMIT 5;
```
- Muestra los primeros 5 usuarios
- Para verificar que la columna se agregó

---

## ⚠️ Errores Comunes

### Error: "permission denied for table users"

**Causa:** No tienes permisos de admin

**Solución:** 
1. Ve a **Settings** → **Database**
2. Usa el **Database password** de admin
3. O usa el script desde el usuario owner del proyecto

### Error: "relation users does not exist"

**Causa:** La tabla `users` no existe

**Solución:**
1. Ve a **Table Editor**
2. Verifica que existe la tabla `users`
3. Si no existe, ejecuta primero: `schema.sql`

---

## 📊 Resultado Esperado

### Antes:
```
users
├── user_id
├── first_name
├── last_name
├── email
├── birth_date
├── gender
└── created_at
```

### Después:
```
users
├── user_id
├── first_name
├── last_name
├── email
├── birth_date
├── gender
├── has_completed_onboarding  ← NUEVA COLUMNA
└── created_at
```

---

## ✅ Checklist

- [ ] Abrí Supabase Dashboard
- [ ] Fui a SQL Editor
- [ ] Copié y pegué el script
- [ ] Ejecuté el script (Run)
- [ ] Vi mensaje de éxito
- [ ] Verifiqué en Table Editor que existe la columna
- [ ] Refresqué la página de login
- [ ] Intenté hacer login de nuevo

---

## 🚀 Siguiente Paso

Una vez que ejecutes el script:

1. **Cierra sesión** si la tienes abierta
2. **Intenta hacer login** con:
   - Email: `murillofrias.miguel@gmail.com`
   - Tu contraseña
3. Deberías ver en consola (F12):
   ```
   ✅ Inicio de sesión exitoso
   👤 Usuario no encontrado en tabla users, creando perfil...
   ✅ Usuario creado exitosamente
   🎓 Usuario nuevo, redirigiendo al tour...
   ```
4. Serás redirigido al **tour de bienvenida**

---

## ❓ ¿Necesitas Ayuda?

Si después de ejecutar el script sigues teniendo problemas:

1. Toma un screenshot del error en Supabase SQL Editor
2. Copia el mensaje de error completo de la consola del navegador (F12)
3. Comparte ambos para ayudarte mejor

---

**⏱️ Tiempo estimado:** 5 minutos  
**🔧 Dificultad:** Fácil (solo copiar y pegar)
