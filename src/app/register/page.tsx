'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones');
      setLoading(false);
      return;
    }

    try {
      // Lógica de registro con Supabase con confirmación de email
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            birth_date: birthDate,
            gender: gender,
          },
        },
      });

      if (error) {
        console.error('❌ Error en Auth signup:', error);
        setError(error.message);
      } else {
        console.log('✅ Usuario registrado en Auth:', data.user?.id);
        
        // Si el usuario fue creado exitosamente, guardar datos en localStorage
        // para crearlos en la tabla users después de confirmar el email
        if (data.user) {
          const [firstName, ...lastNameParts] = fullName.split(' ');
          const lastName = lastNameParts.join(' ') || '';
          
          // Guardar temporalmente los datos del usuario
          localStorage.setItem('pending_user_data', JSON.stringify({
            user_id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
            birth_date: birthDate,
            gender: gender
          }));
          
          console.log('📧 Datos guardados temporalmente. Redirigiendo a confirmación de email...');
        }
        
        // Redirigir a página de confirmación de email
        router.push('/confirm-email');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      console.error('Error de registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card w-full max-w-lg p-8 rounded-3xl shadow-2xl text-white">
      {/* Encabezado */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 mb-4 flex items-center justify-center">
          <img src="/icon.png" alt="Horizon Logo" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="text-3xl font-medium tracking-wider">Horizon</h1>
        <p className="text-sm font-light text-gray-300 mt-1">Crear una nueva cuenta</p>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Formulario dentro de contenedor scrollable */}
      <div className="max-h-[65vh] overflow-y-auto pr-1">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre completo */}
          <div>
            <input
              id="fullName"
              type="text"
              placeholder="Nombre completo"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-line w-full py-2 text-white placeholder-gray-400 focus:placeholder-gray-500"
            />
          </div>

          {/* Email */}
          <div>
            <input
              id="email"
              type="email"
              placeholder="Correo electrónico"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-line w-full py-2 text-white placeholder-gray-400 focus:placeholder-gray-500"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-line w-full pr-10 py-2 text-white placeholder-gray-400 focus:placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-white transition-colors duration-200"
              title="Mostrar/Ocultar contraseña"
            >
              <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>

          {/* Confirmar Contraseña */}
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-line w-full pr-10 py-2 text-white placeholder-gray-400 focus:placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-white transition-colors duration-200"
              title="Mostrar/Ocultar contraseña"
            >
              <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input-line w-full py-2 text-white placeholder-gray-400 focus:placeholder-gray-500"
            />
          </div>

          {/* Género */}
          <div>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="input-line w-full py-2 text-white bg-transparent appearance-none"
            >
              <option value="" className="bg-[#0A192F] text-white">
                Seleccionar género
              </option>
              <option value="male" className="bg-[#0A192F] text-white">
                Masculino
              </option>
              <option value="female" className="bg-[#0A192F] text-white">
                Femenino
              </option>
              <option value="other" className="bg-[#0A192F] text-white">
                Otro
              </option>
              <option value="prefer_not_to_say" className="bg-[#0A192F] text-white">
                Prefiero no decir
              </option>
            </select>
          </div>

          {/* Términos */}
          <div className="flex items-start space-x-3">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
              className="custom-checkbox h-4 w-4 rounded-sm appearance-none border border-gray-500 focus:ring-0 mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-300 font-light">
              Acepto los{' '}
              <a href="#" className="text-[#B4B4B4] hover:underline">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="#" className="text-[#B4B4B4] hover:underline">
                política de privacidad
              </a>
            </label>
          </div>

          {/* Botón */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-semibold text-[#0A192F] bg-[#E1E1E1] hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>

        {/* Separador */}
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-4 flex-shrink text-sm text-gray-400">O registrarse con</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Social */}
        <div className="flex justify-center space-x-4">
          {/* Google */}
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white/10 transition-colors duration-300"
            title="Registrarse con Google"
          >
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
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white/10 transition-colors duration-300"
            title="Registrarse con Microsoft"
          >
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
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white/10 transition-colors duration-300"
            title="Registrarse con LinkedIn"
          >
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

        {/* Enlace inicio sesión */}
        <p className="mt-6 text-center text-sm font-light text-gray-400">
          ¿Ya tienes una cuenta?
          <Link href="/" className="font-semibold text-white hover:text-[#B4B4B4] transition-colors">
            {' '}
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}