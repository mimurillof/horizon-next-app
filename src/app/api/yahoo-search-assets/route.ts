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
    const formattedResults = data.quotes?.slice(0, 10).map((quote: any) => ({
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