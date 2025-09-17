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
    const profileRes = await fetch(profileUrl);
    
    if (!profileRes.ok) {
      throw new Error(`Error al obtener perfil: ${profileRes.statusText}`);
    }
    
    const profileData = await profileRes.json();
    const profile = profileData[0];
    
    if (!profile) {
      return NextResponse.json(
        { message: 'Activo no encontrado' },
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
    console.error('Error en get-asset-profile:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
