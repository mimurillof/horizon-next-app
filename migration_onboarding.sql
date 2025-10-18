-- Script de migración para agregar el flujo de onboarding
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columna has_completed_onboarding a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- 2. Actualizar usuarios existentes para marcarlos como onboarding completo
-- (Asume que los usuarios existentes ya han usado la app)
UPDATE users 
SET has_completed_onboarding = true 
WHERE created_at < NOW() 
AND has_completed_onboarding IS NULL;

-- 3. Agregar comentario a la columna
COMMENT ON COLUMN users.has_completed_onboarding IS 'Indica si el usuario completó el tour de bienvenida y configuración inicial del portafolio';

-- 4. Verificar que la columna se agregó correctamente
SELECT user_id, email, has_completed_onboarding, created_at 
FROM users 
LIMIT 5;
