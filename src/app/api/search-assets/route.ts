import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json(
      { message: 'El parámetro "query" es requerido.' },
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

  const url = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${apiKey}`;

  try {
    const apiRes = await fetch(url);
    
    if (!apiRes.ok) {
      throw new Error(`Error al contactar la API: ${apiRes.statusText}`);
    }
    
    const data = await apiRes.json();
    
    // Filtrar y formatear los resultados para mostrar solo la información relevante
    const formattedData = data.map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      exchangeShortName: item.exchangeShortName,
      type: item.type || 'stock'
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error en search-assets:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
