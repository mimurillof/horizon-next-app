'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Lógica de inicio de sesión con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        console.log('✅ Inicio de sesión exitoso:', data.user);
        
        // Verificar si el email está confirmado
        if (!data.user.email_confirmed_at) {
          setError('Por favor confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // **NUEVO: Intercambiar token de Supabase por JWT del backend**
        console.log('🔄 Intercambiando token de Supabase por JWT del backend...');
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://horizon-backend-316b23e32b8b.herokuapp.com';
        
        let jwtToken: string | null = null;
        
        try {
          const tokenExchangeResponse = await fetch(`${backendUrl}/api/supabase-auth/login-direct`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              password: password
            })
          });

          if (!tokenExchangeResponse.ok) {
            const errorData = await tokenExchangeResponse.json();
            console.error('❌ Error al obtener JWT del backend:', errorData);
            setError(`Error de autenticación: ${errorData.detail || 'No se pudo obtener token del backend'}`);
            setLoading(false);
            return;
          }

          const backendToken = await tokenExchangeResponse.json();
          jwtToken = backendToken.access_token || '';
          console.log('✅ JWT del backend obtenido exitosamente');
          
          // **CRÍTICO: Guardar el JWT en localStorage para que la app React lo use**
          if (jwtToken) {
            localStorage.setItem('token', jwtToken);
            localStorage.setItem('token_type', backendToken.token_type);
            console.log('💾 Token guardado en localStorage');
          }
          
        } catch (tokenError) {
          console.error('❌ Error al intercambiar token:', tokenError);
          setError('Error al autenticar con el backend. Intenta nuevamente.');
          setLoading(false);
          return;
        }

        // Verificar si el usuario existe en la tabla users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('has_completed_onboarding')
          .eq('user_id', data.user.id)
          .single();

        // Si el usuario no existe en la tabla users, crearlo
        if (userError && userError.code === 'PGRST116') {
          console.log('👤 Usuario no encontrado en tabla users, creando perfil...');
          
          // Intentar recuperar datos del localStorage (guardados durante el registro)
          let userDataToCreate = null;
          const pendingUserData = localStorage.getItem('pending_user_data');
          
          if (pendingUserData) {
            console.log('📦 Datos encontrados en localStorage');
            userDataToCreate = JSON.parse(pendingUserData);
          } else {
            // Si no hay datos en localStorage, usar los metadatos de Supabase Auth
            console.log('📋 Usando datos de Supabase Auth metadata');
            const authMetadata = data.user.user_metadata;
            const fullName = authMetadata?.full_name || data.user.email?.split('@')[0] || 'Usuario';
            const [firstName, ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ') || '';
            
            userDataToCreate = {
              user_id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              email: data.user.email,
              birth_date: authMetadata?.birth_date || null,
              gender: authMetadata?.gender || null
            };
          }
          
          // Crear el usuario en la tabla users
          console.log('💾 Creando usuario en tabla users:', userDataToCreate);
          const createUserResponse = await fetch('/api/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userDataToCreate)
          });

          const createUserResult = await createUserResponse.json();

          if (!createUserResponse.ok) {
            console.error('❌ Error al crear usuario:', createUserResult);
            setError(`Error al crear tu perfil: ${createUserResult.error || 'Error desconocido'}. Por favor contacta al soporte.`);
            setLoading(false);
            return;
          }

          console.log('✅ Usuario creado exitosamente:', createUserResult);
          
          // Limpiar localStorage si existía
          if (pendingUserData) {
            localStorage.removeItem('pending_user_data');
          }
          
          // Redirigir al tour (nuevo usuario)
          console.log('🎓 Usuario nuevo, redirigiendo al tour...');
          window.location.href = '/portfolios';
          return;
        } else if (userError) {
          console.error('❌ Error al verificar usuario:', userError);
          setError(`Error al verificar el estado de tu cuenta: ${userError.message}`);
          setLoading(false);
          return;
        }

        console.log('📊 Estado de onboarding:', userData);

        // Obtener URL de la app web desde variable de entorno
        const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://mi-proyecto-topaz-omega.vercel.app';
        console.log('🌐 URL de app web:', webAppUrl);

        // Redirigir según el estado de onboarding
        if (userData?.has_completed_onboarding) {
          // Usuario existente que ya completó onboarding → App web
          console.log('🚀 Usuario existente, redirigiendo a app web...');
          
          // **CRÍTICO: Pasar el token como parámetro URL (será procesado y eliminado)**
          if (jwtToken) {
            const tokenParam = `?token=${encodeURIComponent(jwtToken)}`;
            window.location.href = `${webAppUrl}${tokenParam}`;
          } else {
            window.location.href = webAppUrl;
          }
        } else {
          // Usuario nuevo que no ha completado onboarding → Tour
          console.log('🎓 Usuario nuevo, redirigiendo al tour...');
          window.location.href = '/portfolios';
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      console.error('Error de inicio de sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card w-full max-w-sm p-8 rounded-3xl shadow-2xl text-white">
      {/* Encabezado con logo y bienvenida */}
      <div className="flex flex-col items-center mb-8">
        {/* Logo */}
        <div className="w-20 h-20 mb-4 flex items-center justify-center">
          <img
            src="/icon.png"
            alt="Horizon Logo"
            className="w-20 h-20 object-contain"
          />
        </div>
        {/* Nombre de la Marca */}
        <h1 className="text-3xl font-medium tracking-wider">Horizon</h1>
        {/* Mensaje de Bienvenida */}
        <p className="text-sm font-light text-gray-300 mt-1">¡Bienvenido de nuevo!</p>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Formulario de Login */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo de Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-light text-gray-400">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-line w-full mt-1 p-2 text-white"
            placeholder="Tu correo electrónico"
            required
          />
        </div>

        {/* Campo de Contraseña */}
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-light text-gray-400">
            Contraseña
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-line w-full mt-1 p-2 text-white"
            placeholder="Tu contraseña"
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="material-symbols-outlined absolute right-2 top-9 cursor-pointer text-gray-400 select-none"
          >
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </div>

        {/* Opciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="custom-checkbox h-4 w-4 rounded-sm appearance-none border border-gray-500 focus:ring-0"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 font-light">
              Recordarme
            </label>
          </div>
        </div>

        {/* Botón de Inicio de Sesión */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-semibold text-[#0A192F] bg-[#E1E1E1] hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>

      {/* Separador */}
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="mx-4 flex-shrink text-sm text-gray-400">O continuar con</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>

      {/* Opciones de Inicio de Sesión Social */}
      <div className="flex justify-center space-x-4">
        {/* Google */}
        <button className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white/10 transition-colors duration-300">
          <svg
            className="w-6 h-6"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M43.611 20.083H42V20H24V28H35.303C33.674 32.69 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L36.842 10.323C33.413 7.199 29.002 5 24 5C13.464 5 5 13.464 5 24C5 34.536 13.464 43 24 43C34.536 43 43 34.536 43 24C43 22.618 42.872 21.328 42.611 20.083Z"
              fill="#FFFFFF"
            />
          </svg>
        </button>
        {/* Microsoft */}
        <button className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white/10 transition-colors duration-300">
          <svg
            className="w-6 h-6"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1H10.3256V10.3256H1V1Z" fill="#FFFFFF" />
            <path d="M12.6744 1H22V10.3256H12.6744V1Z" fill="#FFFFFF" />
            <path d="M1 12.6744H10.3256V22H1V12.6744Z" fill="#FFFFFF" />
            <path d="M12.6744 12.6744H22V22H12.6744V12.6744Z" fill="#FFFFFF" />
          </svg>
        </button>
        {/* LinkedIn */}
        <button className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white/10 transition-colors duration-300">
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </button>
      </div>

      {/* Enlace de Registro */}
      <p className="mt-8 text-center text-sm font-light text-gray-400">
        ¿No tienes una cuenta?
        <Link href="/register" className="font-semibold text-white hover:text-[#B4B4B4] transition-colors">
          {' '}
          Registrarte
        </Link>
      </p>
    </div>
  );
}
