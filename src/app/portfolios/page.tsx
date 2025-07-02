'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Portfolio {
  id: number;
  name: string;
  assets: number;
  totalValue: number; // in USD
  lastUpdated: string; // human readable e.g., 'hace 2 horas'
}

export default function PortfoliosPage() {
  const router = useRouter();

  // Datos simulados; en el futuro vendrán de una API
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    {
      id: 1,
      name: 'Acciones de Tecnología',
      assets: 5,
      totalValue: 12500,
      lastUpdated: 'hace 2 horas',
    },
    {
      id: 2,
      name: 'Inversiones a Largo Plazo',
      assets: 3,
      totalValue: 48200,
      lastUpdated: 'hace 5 horas',
    },
    {
      id: 3,
      name: 'Fondo de Dividendos',
      assets: 8,
      totalValue: 22150,
      lastUpdated: 'hace 1 día',
    },
  ]);

  // Crea un nuevo portafolio de forma sencilla
  const handleCreatePortfolio = () => {
    router.push('/portfolios/create');
  };

  const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);

  return (
    <div className="glass-card w-full max-w-2xl p-8 rounded-3xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <img src="/icon.png" alt="Horizon Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-3xl font-medium tracking-wider">Mis Portafolios</h1>
        </div>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm font-light text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </button>
      </div>

      {/* Lista de Portafolios */}
      <div className="max-h-[65vh] overflow-y-auto pr-4">
        {portfolios.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="material-symbols-outlined text-6xl">folder_open</span>
            </div>
            <h3 className="text-xl text-gray-300 mb-2">No tienes portafolios aún</h3>
            <p className="text-gray-400">Crea tu primer portafolio para comenzar a gestionar tus inversiones</p>
          </div>
        ) : (
          <div className="space-y-4">
            {portfolios.map((p) => (
              <div
                key={p.id}
                className="bg-white/5 p-4 rounded-lg flex justify-between items-center hover:bg-white/10 transition-colors"
              >
                <div>
                  <h2 className="text-xl font-semibold">{p.name}</h2>
                  <p className="text-sm text-gray-400">Activos: {p.assets} | Valor Total: ${p.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Última actualización: {p.lastUpdated}</p>
                </div>
                <button
                  onClick={() => alert(`Ir a gestionar activos de ${p.name}`)}
                  className="font-semibold py-2 px-4 rounded-lg text-sm border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] transition-colors"
                >
                  Gestionar Activos
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="mt-6 bg-white/5 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Valor Total de Portafolios</h3>
            <p className="text-2xl font-bold text-[#D4AF37]">${totalValue.toLocaleString()}</p>
          </div>
          {/* Cambio hoy estático por ahora */}
          <div className="text-right">
            <p className="text-sm text-gray-400">Cambio Hoy</p>
            <p className="text-lg font-semibold text-green-400">+2.3% (+$1,864)</p>
          </div>
        </div>
      </div>

      {/* Crear nuevo */}
      <div className="mt-6">
        <button
          onClick={handleCreatePortfolio}
          className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-md font-semibold bg-[#E1E1E1] text-[#0A192F] hover:bg-gray-300 transition-all duration-300"
        >
          <span className="material-symbols-outlined mr-2">add</span>
          Crear Nuevo Portafolio
        </button>
      </div>
    </div>
  );
} 