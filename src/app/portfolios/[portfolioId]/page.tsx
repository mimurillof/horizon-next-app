'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AssetData {
  name: string;
  ticker: string;
  logo: string;
  sector: string;
}

interface Asset {
  id: number;
  assetData?: AssetData;
  value: number; // USD
}

// Simulated assets data
const assetsData: AssetData[] = [
  { name: "Apple Inc.", ticker: "AAPL", logo: "https://logo.clearbit.com/apple.com", sector: "Technology" },
  { name: "Google LLC", ticker: "GOOGL", logo: "https://logo.clearbit.com/google.com", sector: "Technology" },
  { name: "Microsoft Corporation", ticker: "MSFT", logo: "https://logo.clearbit.com/microsoft.com", sector: "Technology" },
  { name: "Amazon.com, Inc.", ticker: "AMZN", logo: "https://logo.clearbit.com/amazon.com", sector: "E-commerce" },
  { name: "Tesla, Inc.", ticker: "TSLA", logo: "https://logo.clearbit.com/tesla.com", sector: "Automotive" },
  { name: "NVIDIA Corporation", ticker: "NVDA", logo: "https://logo.clearbit.com/nvidia.com", sector: "Technology" },
  { name: "Meta Platforms, Inc.", ticker: "META", logo: "https://logo.clearbit.com/meta.com", sector: "Technology" },
  { name: "Berkshire Hathaway Inc.", ticker: "BRK.B", logo: "https://logo.clearbit.com/berkshirehathaway.com", sector: "Finance" },
  { name: "JPMorgan Chase & Co.", ticker: "JPM", logo: "https://logo.clearbit.com/jpmorganchase.com", sector: "Finance" },
  { name: "Exxon Mobil Corporation", ticker: "XOM", logo: "https://logo.clearbit.com/exxonmobil.com", sector: "Energy" },
  { name: "Johnson & Johnson", ticker: "JNJ", logo: "https://logo.clearbit.com/jnj.com", sector: "Healthcare" },
  { name: "Procter & Gamble Co.", ticker: "PG", logo: "https://logo.clearbit.com/pg.com", sector: "Consumer Goods" },
];

interface AssetDropdownProps {
  asset: Asset;
  onAssetSelect: (assetData: AssetData) => void;
}

function AssetDropdown({ asset, onAssetSelect }: AssetDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredAssets = assetsData.filter(assetData =>
    assetData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assetData.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assetData.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Add overflow-visible class to parent containers when dropdown is open
    if (isOpen) {
      const assetsList = document.querySelector('.max-h-\\[65vh\\]');
      const glassCard = document.querySelector('.glass-card');
      
      if (assetsList) assetsList.classList.add('overflow-visible');
      if (glassCard) glassCard.classList.add('overflow-visible');
    } else {
      const assetsList = document.querySelector('.max-h-\\[65vh\\]');
      const glassCard = document.querySelector('.glass-card');
      
      if (assetsList) assetsList.classList.remove('overflow-visible');
      if (glassCard) glassCard.classList.remove('overflow-visible');
    }

    return () => {
      const assetsList = document.querySelector('.max-h-\\[65vh\\]');
      const glassCard = document.querySelector('.glass-card');
      
      if (assetsList) assetsList.classList.remove('overflow-visible');
      if (glassCard) glassCard.classList.remove('overflow-visible');
    };
  }, [isOpen]);

  return (
    <div className="relative flex-grow" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-line w-full text-left py-2 flex justify-between items-center"
      >
        <span className="flex items-center gap-3">
          {asset.assetData ? (
            <>
              <img 
                src={asset.assetData.logo} 
                className="w-6 h-6 rounded-full object-cover bg-gray-600" 
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                alt={asset.assetData.name}
              />
              <div>
                <div>{asset.assetData.name}</div>
                <div className="text-xs text-gray-500">{asset.assetData.ticker} • {asset.assetData.sector}</div>
              </div>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-gray-400">search</span>
              <span className="text-gray-400">Seleccionar o buscar un activo...</span>
            </>
          )}
        </span>
        <span className="material-symbols-outlined">
          {isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0A192F] border border-[#D4AF37] rounded-b-lg max-h-64 overflow-y-auto z-50 shadow-lg">
          <div className="p-2 border-b border-gray-600">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-line w-full p-2 text-white bg-transparent border-b-[#D4AF37]"
              placeholder="Buscar por nombre o ticker..."
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredAssets.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">No se encontraron activos</div>
            ) : (
              filteredAssets.map((assetData) => (
                <button
                  key={assetData.ticker}
                  type="button"
                  onClick={() => {
                    onAssetSelect(assetData);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left p-3 hover:bg-[#003B46] transition-colors flex items-center gap-3 text-white"
                >
                  <img 
                    src={assetData.logo} 
                    className="w-6 h-6 rounded-full object-cover bg-gray-600" 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    alt={assetData.name}
                  />
                  <div>
                    <div>{assetData.name}</div>
                    <div className="text-xs text-gray-500">{assetData.ticker} • {assetData.sector}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssetsPage({
  params,
}: {
  params: { portfolioId: string };
}) {
  const { portfolioId } = params;
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);

  const addAsset = () => {
    setAssets((prev) => [
      ...prev,
      { id: Date.now(), value: 0 },
    ]);
  };

  const updateAssetData = (id: number, assetData: AssetData) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, assetData } : a))
    );
  };

  const updateAssetValue = (id: number, value: number) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, value } : a))
    );
  };

  const removeAsset = (id: number) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);

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
          <p className="text-2xl font-bold text-[#D4AF37]">${totalValue.toLocaleString()}</p>
          <p className="text-xs text-gray-500">
            {assets.length} activo{assets.length !== 1 && 's'}
          </p>
        </div>
      </div>

      {/* Assets list */}
      <div className="max-h-[65vh] overflow-y-auto pr-4 space-y-3 mb-6">
        {assets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="material-symbols-outlined text-6xl">trending_up</span>
            </div>
            <h3 className="text-xl text-gray-300 mb-2">No hay activos en este portafolio</h3>
            <p className="text-gray-400">Agrega tu primer activo para comenzar</p>
          </div>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <AssetDropdown
                asset={asset}
                onAssetSelect={(assetData) => updateAssetData(asset.id, assetData)}
              />
              
              <div className="flex items-center gap-3">
                <div>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={asset.value || ''}
                    onChange={(e) => updateAssetValue(asset.id, parseFloat(e.target.value) || 0)}
                    className="input-line w-32 py-2 text-white placeholder-gray-400 text-right"
                    placeholder="Valor actual ($)"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">USD</p>
                </div>
                
                <button
                  onClick={() => removeAsset(asset.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  title="Eliminar activo"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={addAsset}
          className="flex items-center py-2 px-4 rounded-lg text-sm font-semibold bg-[#D4AF37] text-[#0A192F] hover:bg-[#b89b30] transition-all duration-300"
        >
          <span className="material-symbols-outlined mr-2">add</span>
          Añadir Activo
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setAssets([])}
            className="py-2 px-4 rounded-lg text-sm font-semibold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            Limpiar Todo
          </button>
          <button
            id="save-portfolio-btn"
            onClick={() => {
              const saveBtn = document.getElementById('save-portfolio-btn');
              if (saveBtn) {
                const originalText = saveBtn.textContent;
                saveBtn.innerHTML = `
                  <span class="material-symbols-outlined mr-2">check_circle</span>
                  ¡Portafolio guardado exitosamente!
                `;
                (saveBtn as HTMLButtonElement).disabled = true;
                
                setTimeout(() => {
                  saveBtn.textContent = originalText || 'Guardar Cambios';
                  (saveBtn as HTMLButtonElement).disabled = false;
                }, 2000);
                
                setTimeout(() => {
                  router.push('/portfolios');
                }, 1500);
              }
            }}
            className="py-3 px-6 border border-transparent rounded-lg shadow-sm text-md font-semibold text-[#0A192F] bg-[#E1E1E1] hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}