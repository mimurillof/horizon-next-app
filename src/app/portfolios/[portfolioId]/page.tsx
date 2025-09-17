'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AssetSelector from '@/components/AssetSelector';

// Tipos para los activos del portfolio
interface PortfolioAsset {
  symbol: string;
  companyName: string;
  price: number;
  changes: number;
  changesPercentage: number;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  sector: string;
  currency: string;
  image: string;
  description: string;
  website: string;
  ceo: string;
  country: string;
  ipoDate: string;
  marketCap: number;
  fullTimeEmployees: number;
  lastUpdated: string;
  acquisitionDate: string;
  acquisitionValue: number;
  id: string;
}

export default function AssetsPage({
  params,
}: {
  params: { portfolioId: string };
}) {
  const { portfolioId } = params;
  const router = useRouter();

  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssetsChange = (newAssets: PortfolioAsset[]) => {
    setAssets(newAssets);
  };

  const handleSavePortfolio = async () => {
    setIsLoading(true);
    
    // Aquí puedes implementar la lógica para guardar en base de datos
    console.log('Guardando portafolio:', {
      portfolioId,
      assets,
      totalValue: getTotalValue(),
      totalAssets: assets.length
    });

    // Simular guardado
    setTimeout(() => {
      setIsLoading(false);
      router.push('/portfolios');
    }, 1500);
  };

  const getTotalValue = () => {
    return assets.reduce((sum, asset) => sum + (asset.acquisitionValue || 0), 0);
  };

  return (
    <div className="glass-card w-full max-w-4xl p-8 rounded-3xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/portfolios"
            className="inline-flex items-center gap-2 text-sm font-light text-gray-400 hover:text-white transition-colors mb-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver a Portafolios
          </Link>
          <h1 className="text-3xl font-medium tracking-wider capitalize">{decodeURIComponent(portfolioId)}</h1>
          <p className="text-sm text-gray-400 mt-1">Agrega y gestiona los activos de tu portafolio</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Valor Total</p>
          <p className="text-2xl font-bold text-[#B4B4B4]">${getTotalValue().toLocaleString()}</p>
          <p className="text-xs text-gray-500">
            {assets.length} activo{assets.length !== 1 && 's'}
          </p>
        </div>
      </div>

      {/* Asset Selector Component */}
      <div className="mb-6">
        <AssetSelector 
          onAssetsChange={handleAssetsChange}
          initialAssets={assets}
        />
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setAssets([])}
          className="py-2 px-4 rounded-lg text-sm font-semibold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer"
        >
          Limpiar Todo
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleSavePortfolio}
            disabled={isLoading || assets.length === 0}
            className="py-3 px-6 border border-transparent rounded-lg shadow-sm text-md font-semibold text-[#0A192F] bg-[#E1E1E1] hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined mr-2 animate-spin">refresh</span>
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined mr-2">save</span>
                Guardar y Finalizar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}