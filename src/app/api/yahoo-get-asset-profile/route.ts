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