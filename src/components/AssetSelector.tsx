'use client';

import { useState, useEffect, useRef } from 'react';

// Tipos para los datos de activos
interface SearchResult {
  symbol: string;
  name: string;
  exchangeShortName: string;
  type: string;
}

interface AssetProfile {
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
}

interface PortfolioAsset extends AssetProfile {
  acquisitionDate: string;
  acquisitionValue: number;
  id: string;
}

interface AssetSelectorProps {
  onAssetsChange?: (assets: PortfolioAsset[]) => void;
  initialAssets?: PortfolioAsset[];
}

export default function AssetSelector({ onAssetsChange, initialAssets = [] }: AssetSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>(initialAssets);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search effect
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const debounceTimeout = setTimeout(async () => {
      await searchAssets(searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notify parent component of changes
  useEffect(() => {
    onAssetsChange?.(portfolioAssets);
  }, [portfolioAssets, onAssetsChange]);

  const searchAssets = async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search-assets?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la búsqueda');
      }
      
      setSearchResults(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching assets:', error);
      setError(error instanceof Error ? error.message : 'Error en la búsqueda');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAsset = async (asset: SearchResult) => {
    // Evitar duplicados
    if (portfolioAssets.find(p => p.symbol === asset.symbol)) {
      setError('Este activo ya está en tu portafolio');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/get-asset-profile?symbol=${encodeURIComponent(asset.symbol)}`);
      const profileData = await response.json();
      
      if (!response.ok) {
        throw new Error(profileData.message || 'Error al obtener perfil del activo');
      }

      const newAsset: PortfolioAsset = {
        ...profileData,
        acquisitionDate: new Date().toISOString().split('T')[0],
        acquisitionValue: profileData.price || 0,
        id: `${asset.symbol}-${Date.now()}`
      };

      setPortfolioAssets(prev => [...prev, newAsset]);
      setSearchTerm('');
      setSearchResults([]);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error getting asset profile:', error);
      setError(error instanceof Error ? error.message : 'Error al obtener perfil del activo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    setPortfolioAssets(prev => prev.filter(asset => asset.id !== assetId));
  };

  const handleUpdateAsset = (assetId: string, updates: Partial<PortfolioAsset>) => {
    setPortfolioAssets(prev => 
      prev.map(asset => 
        asset.id === assetId ? { ...asset, ...updates } : asset
      )
    );
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Selector de búsqueda */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-xs text-gray-400 mb-1">Agregar Activo</label>
        <div className="relative">
          <button
            type="button"
            className="input-line w-full text-left py-2 flex justify-between items-center"
            onClick={() => searchInputRef.current?.focus()}
          >
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-400">search</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Seleccionar o buscar un activo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                className="bg-transparent outline-none text-white placeholder-gray-400 flex-1"
              />
            </span>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>
          
          {/* Dropdown con resultados */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 asset-dropdown rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center text-gray-400">
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span className="ml-2">Buscando...</span>
                </div>
              )}
              
              {!loading && searchResults.length === 0 && searchTerm.length >= 2 && (
                <div className="p-4 text-center text-gray-400">
                  No se encontraron resultados para "{searchTerm}"
                </div>
              )}
              
              {!loading && searchResults.map((result) => (
                <button
                  key={`${result.symbol}-${result.exchangeShortName}`}
                  onClick={() => handleSelectAsset(result)}
                  className="asset-item w-full p-3 text-left transition-colors border-b border-white/10 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{result.name}</div>
                      <div className="text-gray-400 text-sm">
                        {result.symbol} • {result.exchangeShortName}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-400">add</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Lista de activos seleccionados */}
      {portfolioAssets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Activos en tu Portafolio</h3>
          <div className="space-y-3">
            {portfolioAssets.map((asset) => (
              <div 
                key={asset.id}
                className="flex items-end gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-2 flex-1">
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="block text-xs text-gray-400 mb-1">Activo</label>
                    <div className="flex items-center gap-3 py-2">
                      {asset.image && (
                        <img 
                          src={asset.image} 
                          alt={asset.companyName}
                          className="w-8 h-8 rounded-full object-cover bg-white/10"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {asset.companyName}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {asset.symbol} • {formatCurrency(asset.price, asset.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <label className="block text-xs text-gray-400 mb-1">
                      Fecha de adquisición
                    </label>
                    <input
                      type="date"
                      max={getMaxDate()}
                      value={asset.acquisitionDate}
                      onChange={(e) => handleUpdateAsset(asset.id, { acquisitionDate: e.target.value })}
                      className="input-line w-36 py-2 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Valor actual"
                      value={asset.acquisitionValue}
                      onChange={(e) => handleUpdateAsset(asset.id, { acquisitionValue: parseFloat(e.target.value) || 0 })}
                      className="input-line w-28 py-2 text-white placeholder-gray-400 text-right"
                    />
                    <span className="text-xs text-gray-500">{asset.currency}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemoveAsset(asset.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  title="Eliminar activo"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
