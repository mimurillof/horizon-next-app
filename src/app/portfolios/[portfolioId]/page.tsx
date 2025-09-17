'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AssetSelector from '@/components/AssetSelector';
import { supabase } from '@/lib/supabaseClient';

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
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Obtener usuario actual al montar el componente
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        console.log('📝 [ASSETS-PAGE] Usuario actual:', session.user.id);
      } else {
        console.error('❌ [ASSETS-PAGE] No hay usuario autenticado');
        router.push('/register'); // Redirigir al registro si no hay usuario
      }
    };

    getCurrentUser();
  }, [router]);

  const handleAssetsChange = (newAssets: PortfolioAsset[]) => {
    setAssets(newAssets);
  };

  const handleSavePortfolio = async () => {
    setIsLoading(true);
    
    try {
      if (!currentUser?.id) {
        throw new Error('Usuario no autenticado');
      }

      console.log('🔄 [SAVE-PORTFOLIO] Guardando portafolio:', {
        portfolioId,
        userId: currentUser.id,
        assets: assets.length,
        totalValue: getTotalValue()
      });

      // Guardar cada activo en la base de datos
      const savePromises = assets.map(async (asset) => {
        // Calcular cantidad basada en el valor de adquisición y precio actual
        const quantity = asset.price > 0 ? asset.acquisitionValue / asset.price : 1;
        
        const assetData = {
          user_id: currentUser.id,
          portfolio_id: parseInt(portfolioId),
          asset_symbol: asset.symbol,
          quantity: quantity,
          acquisition_price: asset.acquisitionValue, // Valor total pagado
          acquisition_date: asset.acquisitionDate
        };

        console.log('📝 [SAVE-ASSET] Guardando activo:', assetData);

        const response = await fetch('/api/add-asset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assetData),
        });

        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(`Error al guardar ${asset.symbol}: ${result.error}`);
        }

        console.log('✅ [SAVE-ASSET] Activo guardado:', result.data);
        return result.data;
      });

      // Esperar a que se guarden todos los activos
      const savedAssets = await Promise.all(savePromises);
      
      console.log('✅ [SAVE-PORTFOLIO] Todos los activos guardados exitosamente:', savedAssets);

      // Redirigir a la lista de portafolios
      setTimeout(() => {
        setIsLoading(false);
        router.push('/portfolios');
      }, 1000);

    } catch (error) {
      console.error('❌ [SAVE-PORTFOLIO] Error:', error);
      setIsLoading(false);
      alert(error instanceof Error ? error.message : 'Error al guardar el portafolio');
    }
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