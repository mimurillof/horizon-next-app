'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 mb-4 flex items-center justify-center">
          <img src="/icon.png" alt="Horizon Logo" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="text-3xl font-medium tracking-wider text-center">Confirma tu Correo</h1>
      </div>

      {/* Icono de Email */}
      <div className="flex justify-center mb-6">
        <div className="bg-blue-500/20 p-6 rounded-full">
          <span className="material-symbols-outlined text-blue-400" style={{ fontSize: '4rem' }}>
            mail
          </span>
        </div>
      </div>

      {/* Mensaje */}
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold text-white">¡Cuenta Creada con Éxito!</h2>
        
        <p className="text-gray-300 text-sm leading-relaxed">
          Te hemos enviado un <strong>enlace de confirmación</strong> a tu correo electrónico.
        </p>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300 text-sm font-medium mb-2">
            <span className="material-symbols-outlined text-lg align-middle mr-1">priority_high</span>
            Acción requerida
          </p>
          <ol className="text-yellow-200 text-xs text-left space-y-2 pl-4">
            <li>1. Revisa tu bandeja de entrada (y carpeta de spam)</li>
            <li>2. Haz clic en el enlace de confirmación</li>
            <li>3. Regresa aquí e inicia sesión</li>
          </ol>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
          <p className="text-blue-300 text-xs">
            <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
            <strong>Importante:</strong> No podrás iniciar sesión hasta que confirmes tu correo electrónico.
          </p>
        </div>

        {/* Contador */}
        <p className="text-gray-400 text-xs mt-6">
          Redirigiendo al login en {countdown} segundos...
        </p>
      </div>

      {/* Botón de acción */}
      <div className="mt-8 space-y-3">
        <Link
          href="/"
          className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-md font-semibold text-[#0A192F] bg-[#E1E1E1] hover:bg-gray-300 transition-all duration-300"
        >
          <span className="material-symbols-outlined mr-2">login</span>
          Ir al Login
        </Link>

        <p className="text-center text-xs text-gray-400">
          ¿No recibiste el correo?{' '}
          <Link href="/register" className="text-[#B4B4B4] hover:underline">
            Registrarte de nuevo
          </Link>
        </p>
      </div>
    </div>
  );
}
