-- Script para crear usuarios faltantes en la tabla users
-- Ejecutar este script en Supabase SQL Editor si tienes usuarios en Auth pero no en la tabla users

-- 1. Ver usuarios que están en Auth pero NO en la tabla users
SELECT 
    au.id as user_id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'birth_date' as birth_date,
    au.raw_user_meta_data->>'gender' as gender,
    au.created_at,
    au.email_confirmed_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.user_id
WHERE u.user_id IS NULL;

-- 2. Crear usuarios faltantes en la tabla users
-- (Ejecutar este script solo después de verificar la consulta anterior)

INSERT INTO public.users (user_id, first_name, last_name, email, birth_date, gender, has_completed_onboarding)
SELECT 
    au.id,
    SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', au.email), ' ', 1) as first_name,
    NULLIF(SUBSTRING(COALESCE(au.raw_user_meta_data->>'full_name', '') FROM POSITION(' ' IN COALESCE(au.raw_user_meta_data->>'full_name', '')) + 1), '') as last_name,
    au.email,
    (au.raw_user_meta_data->>'birth_date')::date,
    CASE 
        WHEN au.raw_user_meta_data->>'gender' = 'male' THEN 'male'::gender_enum
        WHEN au.raw_user_meta_data->>'gender' = 'female' THEN 'female'::gender_enum
        WHEN au.raw_user_meta_data->>'gender' = 'other' THEN 'other'::gender_enum
        WHEN au.raw_user_meta_data->>'gender' IN ('prefer_not_to_say', 'prefer-not-to-say') THEN 'prefer_not_to_say'::gender_enum
        ELSE NULL
    END as gender,
    false as has_completed_onboarding
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.user_id
WHERE u.user_id IS NULL
  AND au.email_confirmed_at IS NOT NULL  -- Solo usuarios con email confirmado
ON CONFLICT (user_id) DO NOTHING;

-- 3. Verificar que se crearon correctamente
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.has_completed_onboarding,
    au.email_confirmed_at
FROM public.users u
JOIN auth.users au ON u.user_id = au.id
ORDER BY u.created_at DESC
LIMIT 10;
