# Código del Sistema de Portafolio con Selección de Assets

Este archivo contiene todo el código necesario para crear un sistema de portafolio que permite seleccionar assets de una lista usando Yahoo Finance API.

## Estructura de Archivos Necesarios

```
src/
├── components/
│   └── AssetSelector.tsx          # Componente principal de selección
├── app/
│   ├── api/
│   │   ├── yahoo-search-assets/
│   │   │   └── route.ts           # API para buscar assets
│   │   ├── yahoo-get-asset-profile/
│   │   │   └── route.ts           # API para obtener perfil del asset
│   │   └── add-asset/
│   │       └── route.ts           # API para guardar assets
│   └── portfolios/
│       └── [portfolioId]/
│           └── page.tsx           # Página que usa el AssetSelector
└── app/
    └── globals.css                # Estilos necesarios
```

---

## 1. Componente AssetSelector.tsx

```tsx
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
      const response = await fetch(`/api/yahoo-search-assets?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la búsqueda');
      }
      
      setSearchResults(data.data || []);
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
      const response = await fetch(`/api/yahoo-get-asset-profile?symbol=${encodeURIComponent(asset.symbol)}`);
      const result = await response.json();
      
      if (!response.ok) {
        const errorMsg = result.error || 'Error al obtener perfil del activo';
        console.error('Yahoo API Error:', result);
        
        if (response.status === 404) {
          throw new Error(`${asset.symbol} no se encuentra. Verifica que el símbolo sea correcto.`);
        } else {
          throw new Error(errorMsg);
        }
      }

      const profileData = result.data;
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
                  No se encontraron resultados para &quot;{searchTerm}&quot;
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
                      value={asset.acquisitionValue || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleUpdateAsset(asset.id, { 
                          acquisitionValue: value === '' ? 0 : parseFloat(value) 
                        });
                      }}
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
```

---

## 2. API: yahoo-search-assets/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Función para buscar activos usando Yahoo Finance API alternativa
async function searchYahooFinance(query: string) {
  try {
    // Usaremos la API pública de Yahoo Finance a través de query1.finance.yahoo.com
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance search failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Formatear resultados para que coincidan con el formato esperado
    const formattedResults = data.quotes?.slice(0, 10).map((quote: { symbol: string; longname?: string; shortname?: string; exchange?: string; quoteType?: string }) => ({
      symbol: quote.symbol,
      name: quote.longname || quote.shortname || quote.symbol,
      exchangeShortName: quote.exchange || 'Unknown',
      type: quote.quoteType || 'equity'
    })) || [];

    return formattedResults;
  } catch (error) {
    console.error('Error searching Yahoo Finance:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query debe tener al menos 2 caracteres'
      }, { status: 400 });
    }

    console.log('🔍 [YAHOO-SEARCH] Buscando:', query);

    const results = await searchYahooFinance(query.trim());

    console.log(`✅ [YAHOO-SEARCH] Encontrados ${results.length} resultados para: ${query}`);

    return NextResponse.json({
      success: true,
      data: results,
      message: `${results.length} resultados encontrados`
    });

  } catch (error) {
    console.error('❌ [YAHOO-SEARCH] Error inesperado:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
```

---

## 3. API: yahoo-get-asset-profile/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Función para obtener información del activo desde Yahoo Finance
async function getYahooAssetProfile(symbol: string) {
  try {
    // Obtener información básica del símbolo
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    
    const response = await fetch(quoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance failed: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      throw new Error('No data found for symbol');
    }

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
    const change = meta.regularMarketPrice - meta.previousClose || 0;
    const changePercent = meta.previousClose > 0 ? (change / meta.previousClose) * 100 : 0;

    // Formatear datos para coincidir con el formato esperado por el frontend
    const assetProfile = {
      symbol: meta.symbol,
      companyName: meta.longName || meta.shortName || meta.symbol,
      price: currentPrice,
      changes: change,
      changesPercentage: changePercent,
      exchange: meta.fullExchangeName || meta.exchangeName || 'Unknown',
      exchangeShortName: meta.exchangeName || 'Unknown',
      industry: 'Technology', // Yahoo Finance básico no proporciona esto fácilmente
      sector: 'Technology',   // Valor por defecto
      currency: meta.currency || 'USD',
      image: `https://logo.clearbit.com/${meta.symbol.toLowerCase()}.com`, // Logo genérico
      description: `${meta.longName || meta.symbol} traded on ${meta.exchangeName || 'stock exchange'}`,
      website: `https://finance.yahoo.com/quote/${meta.symbol}`,
      ceo: 'N/A',
      country: meta.exchangeTimezoneName?.includes('America') ? 'US' : 'Unknown',
      ipoDate: 'N/A',
      marketCap: meta.marketCap || 0,
      fullTimeEmployees: 0,
      lastUpdated: new Date().toISOString()
    };

    return assetProfile;
  } catch (error) {
    console.error(`Error getting Yahoo Finance data for ${symbol}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({
        success: false,
        error: 'Symbol es requerido'
      }, { status: 400 });
    }

    console.log('📊 [YAHOO-PROFILE] Obteniendo perfil para:', symbol);

    const profile = await getYahooAssetProfile(symbol.toUpperCase());

    console.log('✅ [YAHOO-PROFILE] Perfil obtenido:', profile.symbol);

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Perfil obtenido exitosamente'
    });

  } catch (error) {
    console.error('❌ [YAHOO-PROFILE] Error:', error);
    
    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (error.message.includes('No data found')) {
        return NextResponse.json({
          success: false,
          error: 'Símbolo no encontrado. Verifica que el símbolo sea correcto.'
        }, { status: 404 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Error al obtener información del activo'
    }, { status: 500 });
  }
}
```

---

## 4. API: add-asset/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
// Importa tu cliente de base de datos aquí (ej: supabaseAdmin, prisma, etc.)

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del request
    const { 
      user_id,
      portfolio_id, 
      asset_symbol, 
      quantity, 
      acquisition_price, 
      acquisition_date 
    } = await request.json();

    // Validaciones básicas
    if (!user_id || !portfolio_id || !asset_symbol || !quantity || !acquisition_price || !acquisition_date) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son obligatorios (incluyendo user_id)' },
        { status: 400 }
      );
    }

    if (quantity <= 0 || acquisition_price <= 0) {
      return NextResponse.json(
        { success: false, error: 'La cantidad y el precio deben ser mayores a 0' },
        { status: 400 }
      );
    }

    console.log('📝 [ADD-ASSET] Agregando activo para usuario:', user_id);
    console.log('📝 [ADD-ASSET] Datos:', { portfolio_id, asset_symbol, quantity, acquisition_price, acquisition_date });

    // Aquí debes implementar la lógica para guardar en tu base de datos
    // Ejemplo con Supabase:
    /*
    const { data: asset, error: assetError } = await supabaseAdmin
      .from('assets')
      .insert({
        portfolio_id: parseInt(portfolio_id),
        asset_symbol: asset_symbol.toUpperCase().trim(),
        quantity: parseFloat(quantity),
        acquisition_price: parseFloat(acquisition_price),
        acquisition_date: acquisition_date
      })
      .select('*')
      .single();

    if (assetError) {
      console.error('❌ [ADD-ASSET] Error al insertar activo:', assetError);
      return NextResponse.json(
        { success: false, error: `Error al agregar activo: ${assetError.message}` },
        { status: 500 }
      );
    }
    */

    // Por ahora retornamos éxito (debes implementar la lógica de BD)
    return NextResponse.json({
      success: true,
      data: {
        portfolio_id: parseInt(portfolio_id),
        asset_symbol: asset_symbol.toUpperCase().trim(),
        quantity: parseFloat(quantity),
        acquisition_price: parseFloat(acquisition_price),
        acquisition_date: acquisition_date
      },
      message: 'Activo agregado exitosamente'
    });

  } catch (error) {
    console.error('❌ [ADD-ASSET] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

---

## 5. Página de ejemplo: portfolios/[portfolioId]/page.tsx

```tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AssetSelector from '@/components/AssetSelector';
// Importa tu cliente de autenticación aquí

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
  params: Promise<{ portfolioId: string }>;
}) {
  const { portfolioId } = use(params);
  const router = useRouter();

  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [portfolioName, setPortfolioName] = useState<string>('');

  // Obtener usuario actual
  useEffect(() => {
    const getCurrentUser = async () => {
      // Implementa tu lógica de autenticación aquí
      // Ejemplo:
      // const { data: { session } } = await supabase.auth.getSession();
      // if (session?.user) {
      //   setCurrentUser(session.user);
      // }
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

      // Guardar cada activo en la base de datos
      const savePromises = assets.map(async (asset) => {
        // Calcular cantidad basada en el valor de adquisición y precio actual
        const quantity = asset.price > 0 ? asset.acquisitionValue / asset.price : 1;
        
        const assetData = {
          user_id: currentUser.id,
          portfolio_id: parseInt(portfolioId),
          asset_symbol: asset.symbol,
          quantity: quantity,
          acquisition_price: asset.acquisitionValue,
          acquisition_date: asset.acquisitionDate
        };

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

        return result.data;
      });

      // Esperar a que se guarden todos los activos
      await Promise.all(savePromises);
      
      setIsLoading(false);
      alert('Portafolio guardado exitosamente');
      // Redirigir o actualizar UI según necesites

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
          <h1 className="text-3xl font-medium tracking-wider">
            {portfolioName || `Portafolio ${portfolioId}`}
          </h1>
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
  );
}
```

---

## 6. Estilos CSS necesarios (agregar a globals.css)

```css
/* Input Line Styles */
.input-line {
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid #555E68 !important;
  transition: border-bottom-color 0.3s ease;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.input-line:focus {
  outline: none !important;
  border-bottom: 1px solid #D4AF37 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.input-line::placeholder {
  color: #9CA3AF;
}

.input-line:focus-within {
  border-bottom-color: #D4AF37 !important;
  box-shadow: 0 1px 0 0 #D4AF37 !important;
}

/* Material Symbols */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
  user-select: none;
}

/* Glass Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* Asset Selector specific styles */
.asset-dropdown {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(10, 25, 47, 0.9);
  border: 1px solid rgba(180, 180, 180, 0.2);
}

.asset-dropdown::-webkit-scrollbar {
  width: 6px;
}

.asset-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.asset-dropdown::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.asset-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 7. Dependencias necesarias (package.json)

Asegúrate de tener estas dependencias instaladas:

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

---

## Cómo usar

1. **Copia los archivos** en la estructura de carpetas indicada
2. **Instala las dependencias** necesarias
3. **Configura tu base de datos** en `add-asset/route.ts`
4. **Configura la autenticación** en la página del portfolio
5. **Agrega los estilos CSS** a tu archivo `globals.css`
6. **Importa Material Symbols** en tu HTML o usa iconos alternativos

---

## Características principales

- ✅ Búsqueda en tiempo real de assets usando Yahoo Finance API
- ✅ Dropdown con resultados de búsqueda
- ✅ Prevención de duplicados
- ✅ Edición de fecha de adquisición y valor
- ✅ Eliminación de assets del portafolio
- ✅ Cálculo automático del valor total
- ✅ Diseño responsive con glass morphism
- ✅ Manejo de errores y estados de carga

---

## Notas importantes

- La API de Yahoo Finance es pública pero puede tener limitaciones de rate
- Los logos de empresas usan Clearbit (puedes cambiarlo por otra fuente)
- Ajusta los estilos según tu diseño
- Implementa la lógica de base de datos según tu stack (Supabase, Prisma, etc.)
- Ajusta la autenticación según tu sistema

