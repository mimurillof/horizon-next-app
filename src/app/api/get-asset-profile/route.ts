import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  
  if (!symbol) {
    return NextResponse.json(
      { message: 'El parámetro "symbol" es requerido.' },
      { status: 400 }
    );
  }

  // Lista de símbolos que típicamente requieren plan premium
  const premiumSymbols = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'];
  
  if (premiumSymbols.includes(symbol)) {
    return NextResponse.json(
      { 
        message: `El símbolo ${symbol} (índice) requiere un plan premium de Financial Modeling Prep.`,
        suggestion: 'Intenta con acciones individuales como AAPL, MSFT, GOOGL, TSLA, etc.'
      },
      { status: 403 }
    );
  }

  const apiKey = process.env.FMP_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { message: 'API key no configurada. Asegúrate de configurar FMP_API_KEY en tu archivo .env.local' },
      { status: 500 }
    );
  }

  try {
    // Obtener el perfil de la empresa
    const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(symbol)}?apikey=${apiKey}`;
    console.log('Fetching profile from:', profileUrl);
    const profileRes = await fetch(profileUrl);
    
    if (!profileRes.ok) {
      console.error(`Profile API error: ${profileRes.status} ${profileRes.statusText}`);
      
      // Manejo específico para diferentes códigos de error
      if (profileRes.status === 403) {
        throw new Error(`Acceso denegado para ${symbol}. El símbolo puede requerir un plan premium o haber alcanzado el límite de la API.`);
      } else if (profileRes.status === 429) {
        throw new Error(`Límite de requests excedido. Intenta nuevamente en unos minutos.`);
      } else {
        throw new Error(`Error al obtener perfil: ${profileRes.statusText}`);
      }
    }
    
    const profileData = await profileRes.json();
    console.log('Profile response:', profileData);
    const profile = profileData[0];
    
    if (!profile) {
      // Intentar con crypto API como fallback
      console.log('Profile not found, trying crypto API...');
      const cryptoUrl = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbol)}?apikey=${apiKey}`;
      const cryptoRes = await fetch(cryptoUrl);
      
      if (cryptoRes.ok) {
        const cryptoData = await cryptoRes.json();
        const crypto = cryptoData[0];
        
        if (crypto) {
          // Crear un perfil básico para cryptocurrency
          const cryptoProfile = {
            symbol: crypto.symbol,
            companyName: crypto.name || symbol,
            price: crypto.price || 0,
            changes: crypto.change || 0,
            changesPercentage: crypto.changesPercentage || 0,
            exchange: crypto.exchange || 'CRYPTO',
            exchangeShortName: crypto.exchange || 'CRYPTO',
            industry: 'Cryptocurrency',
            sector: 'Digital Assets',
            currency: 'USD',
            image: `https://financialmodelingprep.com/image-stock/${symbol}.png`,
            description: `${symbol} cryptocurrency trading pair`,
            website: '',
            ceo: '',
            country: '',
            ipoDate: '',
            marketCap: crypto.marketCap || 0,
            fullTimeEmployees: 0,
            lastUpdated: new Date().toISOString()
          };
          
          return NextResponse.json(cryptoProfile);
        }
      }
      
      return NextResponse.json(
        { message: `Activo ${symbol} no encontrado en ninguna fuente de datos` },
        { status: 404 }
      );
    }

    // Obtener el precio actual
    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbol)}?apikey=${apiKey}`;
    const quoteRes = await fetch(quoteUrl);
    let currentPrice = profile.price || 0;
    
    if (quoteRes.ok) {
      const quoteData = await quoteRes.json();
      if (quoteData[0]) {
        currentPrice = quoteData[0].price || currentPrice;
      }
    }

    // Formatear la respuesta con toda la información necesaria
    const formattedProfile = {
      symbol: profile.symbol,
      companyName: profile.companyName,
      price: currentPrice,
      changes: profile.changes || 0,
      changesPercentage: profile.changesPercentage || 0,
      exchange: profile.exchange,
      exchangeShortName: profile.exchangeShortName,
      industry: profile.industry,
      sector: profile.sector,
      currency: profile.currency || 'USD',
      image: profile.image,
      description: profile.description,
      website: profile.website,
      ceo: profile.ceo,
      country: profile.country,
      ipoDate: profile.ipoDate,
      marketCap: profile.mktCap,
      fullTimeEmployees: profile.fullTimeEmployees,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json(formattedProfile);
  } catch (error) {
    console.error(`Error en get-asset-profile para ${symbol}:`, error);
    
    // Proporcionar más contexto sobre el error
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    const detailedMessage = `Error al obtener información para ${symbol}: ${errorMessage}. 
      Verifica que el símbolo sea correcto y esté disponible en Financial Modeling Prep.`;
    
    return NextResponse.json(
      { 
        message: detailedMessage,
        symbol: symbol,
        suggestion: 'Intenta con otro símbolo o verifica que el activo esté listado en mercados tradicionales.'
      },
      { status: 500 }
    );
  }
}
