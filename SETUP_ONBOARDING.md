# 🚀 Instrucciones de Implementación del Flujo de Onboarding

## Pasos a Seguir

### 1. ✅ Actualizar Base de Datos en Supabase

**Opción A: Para base de datos nueva**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el archivo `schema.sql` completo (ya incluye `has_completed_onboarding`)

**Opción B: Para base de datos existente**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el archivo `migration_onboarding.sql`
3. Esto agregará la columna `has_completed_onboarding` sin afectar datos existentes

### 2. ✅ Configurar Email de Confirmación en Supabase

1. **Ir a Authentication → Email Templates**
   - Asegúrate de que "Confirm signup" esté habilitado
   - Verifica que el template incluya `{{ .ConfirmationURL }}`

2. **Ir a Authentication → URL Configuration**
   - **Site URL**: `http://localhost:3000` (desarrollo) o `https://tu-dominio.com` (producción)
   - **Redirect URLs**: Agregar la misma URL del Site URL

3. **Ir a Authentication → Providers → Email**
   - Habilitar "Email provider"
   - Activar "Confirm email" (requerir confirmación)
   - Guardar cambios

### 3. ✅ Variables de Entorno

Verifica que tu archivo `.env.local` tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

**⚠️ IMPORTANTE**: El `SUPABASE_SERVICE_ROLE_KEY` es necesario para la API `/api/complete-onboarding`

### 4. ✅ Configurar SMTP (Opcional pero Recomendado)

Por defecto, Supabase usa su propio servicio de email, pero tiene límites:

**Para producción, configura SMTP personalizado:**
1. Ir a Project Settings → Auth
2. Scroll hasta "SMTP Settings"
3. Configurar con tu proveedor (Gmail, SendGrid, etc.)

**Ejemplo con Gmail:**
```
Host: smtp.gmail.com
Port: 587
Username: tu-email@gmail.com
Password: tu-app-password (no la contraseña normal)
Sender email: tu-email@gmail.com
Sender name: Horizon Investment Hub
```

### 5. ✅ Instalar Dependencias (si es necesario)

```bash
npm install
```

### 6. ✅ Probar el Flujo Localmente

```bash
npm run dev
```

Luego:
1. Ir a `http://localhost:3000/register`
2. Crear un usuario nuevo
3. Verificar que redirige a `/confirm-email`
4. Revisar tu email y hacer clic en el link de confirmación
5. Iniciar sesión
6. Verificar que redirige al tour (`/portfolios`)
7. Completar todo el flujo
8. Verificar que al final redirige a la app web

### 7. ✅ Actualizar URL de App Web (Producción)

En los siguientes archivos, cambia la URL de la app web si es diferente:

**`src/app/page.tsx` (línea ~46)**
```typescript
window.location.href = 'https://tu-app-web-real.vercel.app/';
```

**`src/app/portfolios/[portfolioId]/page.tsx` (línea ~147)**
```typescript
window.location.href = 'https://tu-app-web-real.vercel.app/';
```

## 📋 Checklist de Verificación

Antes de ir a producción, verifica:

- [ ] Columna `has_completed_onboarding` agregada en Supabase
- [ ] Email de confirmación habilitado en Supabase
- [ ] SMTP configurado (opcional pero recomendado)
- [ ] Site URL y Redirect URLs configurados en Supabase
- [ ] Variables de entorno configuradas correctamente
- [ ] URL de app web actualizada en el código
- [ ] Flujo probado localmente de principio a fin
- [ ] Usuarios existentes marcados como onboarding completo

## 🐛 Troubleshooting

### No recibo el email de confirmación
1. Revisa la carpeta de spam
2. Verifica que "Confirm email" esté habilitado en Supabase
3. Revisa los logs de Supabase en Dashboard → Logs
4. Considera configurar SMTP personalizado

### Usuario va al tour después de completar onboarding
1. Abre Supabase → Table Editor → users
2. Busca el usuario por email
3. Verifica que `has_completed_onboarding = true`
4. Si es `false`, ejecuta:
   ```sql
   UPDATE users 
   SET has_completed_onboarding = true 
   WHERE email = 'email@usuario.com';
   ```

### Error "SUPABASE_SERVICE_ROLE_KEY is not defined"
1. Verifica que la variable está en `.env.local`
2. Reinicia el servidor de desarrollo
3. Si estás en producción, agrega la variable en tu plataforma de deployment

### Link de confirmación no funciona
1. Verifica que el Site URL en Supabase coincide con tu dominio
2. Agrega tu dominio a Redirect URLs
3. Si estás en desarrollo, usa `http://localhost:3000`

## 📚 Documentación Adicional

- Ver `ONBOARDING_FLOW.md` para el flujo completo detallado
- Ver `schema.sql` para el esquema completo de la base de datos
- Ver `migration_onboarding.sql` para migración de bases existentes

## 🎯 Próximos Pasos

Después de implementar el onboarding:

1. **Monitorear**: Revisa los logs para identificar problemas
2. **Feedback**: Recopila feedback de usuarios sobre el tour
3. **Optimizar**: Ajusta el contenido del tour según necesidad
4. **Analytics**: Considera agregar tracking de eventos para cada paso

---

**¿Necesitas ayuda?** Revisa los logs de consola del navegador (F12) - hay logging extensivo en cada paso del flujo.
