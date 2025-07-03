'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MAX_NAME = 50;
const MAX_DESC = 200;

export default function CreatePortfolioPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [created, setCreated] = useState(false);

  // Relleno rápido
  const fillSampleData = (type: 'tech' | 'dividends' | 'crypto') => {
    switch (type) {
      case 'tech':
        setName('Acciones de Tecnología');
        setDescription('Portafolio centrado en grandes empresas tecnológicas de alto crecimiento.');
        break;
      case 'dividends':
        setName('Fondo de Dividendos');
        setDescription('Cartera diversificada de acciones con alto rendimiento de dividendos.');
        break;
      case 'crypto':
        setName('Criptomonedas');
        setDescription('Inversiones en activos digitales con alto potencial de retorno.');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    console.log('Nuevo portafolio creado:', { name, description });

    // Mostrar mensaje de éxito y redirigir a la página de assets
    setCreated(true);

    setTimeout(() => {
      router.push(`/portfolios/${encodeURIComponent(name)}/questions`);
    }, 1500);
  };

  return (
    <div className="glass-card w-full max-w-sm p-8 rounded-3xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 mb-4 flex items-center justify-center">
          <img src="/icon.png" alt="Horizon Logo" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="text-3xl font-medium tracking-wider text-center">Crear Nuevo Portafolio</h1>
        <p className="text-sm font-light text-gray-300 mt-2 text-center">
          Dale un nombre a tu nuevo portafolio de inversiones
        </p>
      </div>

      {!created ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label htmlFor="portfolio-name" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Portafolio
            </label>
            <input
              id="portfolio-name"
              type="text"
              placeholder="Ej: Acciones de Tecnología, Fondos de Inversión..."
              required
              maxLength={MAX_NAME}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-line w-full py-2 text-white placeholder-gray-400 focus:placeholder-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">{name.length}/{MAX_NAME} caracteres</p>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="portfolio-description" className="block text-sm font-medium text-gray-300 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              id="portfolio-description"
              rows={3}
              placeholder="Describe el propósito o estrategia de este portafolio..."
              maxLength={MAX_DESC}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-line w-full py-2 text-white placeholder-gray-400 focus:placeholder-gray-500 resize-none"
            ></textarea>
            <p className="text-xs text-gray-400 mt-1">{description.length}/{MAX_DESC} caracteres</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-semibold text-[#0A192F] bg-[#E1E1E1] hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300"
            >
              <span className="material-symbols-outlined mr-2">add_circle</span>
              Crear Portafolio
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="text-green-400 mb-4 flex justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: '7rem', minHeight: '7rem', lineHeight: '1' }}>check_circle</span>
          </div>
          <h3 className="text-xl text-white mb-2">¡Portafolio Creado!</h3>
          <p className="text-gray-300">Redirigiendo a la gestión de activos...</p>
        </div>
      )}

      {/* Navegación */}
      <div className="mt-8 space-y-3">
        <p className="text-center">
          <Link
            href="/portfolios"
            className="inline-flex items-center gap-2 text-sm font-light text-gray-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver al inicio
          </Link>
        </p>

        <div className="border-t border-gray-600 pt-4">
          <p className="text-xs text-gray-500 text-center mb-3">Acciones rápidas</p>
          <div className="flex justify-center gap-4">
            <button
              className="text-xs text-gray-400 hover:text-[#B4B4B4] transition-colors"
              onClick={() => fillSampleData('tech')}
              type="button"
            >
              Portafolio Tech
            </button>
            <button
              className="text-xs text-gray-400 hover:text-[#B4B4B4] transition-colors"
              onClick={() => fillSampleData('dividends')}
              type="button"
            >
              Fondo Dividendos
            </button>
            <button
              className="text-xs text-gray-400 hover:text-[#B4B4B4] transition-colors"
              onClick={() => fillSampleData('crypto')}
              type="button"
            >
              Criptomonedas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}