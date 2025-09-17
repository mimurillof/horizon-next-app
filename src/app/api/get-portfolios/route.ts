import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Extraer el user_id del header de Authorization o query params
    const authHeader = request.headers.get('Authorization');
    const userId = request.nextUrl.searchParams.get('user_id');
    
    if (!userId) {
      console.error('❌ [GET-PORTFOLIOS] user_id requerido');
      return NextResponse.json(
        { success: false, error: 'user_id es requerido' },
        { status: 400 }
      );
    }

    console.log('📝 [GET-PORTFOLIOS] Obteniendo portafolios para usuario:', userId);

    // Obtener portafolios del usuario con conteo de activos
    const { data: portfolios, error: portfoliosError } = await supabaseAdmin
      .from('portfolios')
      .select(`
        portfolio_id,
        portfolio_name,
        description,
        created_at,
        assets(asset_id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (portfoliosError) {
      console.error('❌ [GET-PORTFOLIOS] Error al obtener portafolios:', portfoliosError);
      return NextResponse.json(
        { success: false, error: `Error al obtener portafolios: ${portfoliosError.message}` },
        { status: 500 }
      );
    }

    // Formatear la respuesta con conteo de activos
    const formattedPortfolios = portfolios?.map((portfolio: any) => ({
      ...portfolio,
      assetCount: portfolio.assets?.length || 0,
      assets: undefined // Remover el array de assets de la respuesta
    })) || [];

    console.log('✅ [GET-PORTFOLIOS] Portafolios obtenidos:', formattedPortfolios);

    return NextResponse.json({
      success: true,
      data: formattedPortfolios,
      message: 'Portafolios obtenidos exitosamente'
    });

  } catch (error) {
    console.error('❌ [GET-PORTFOLIOS] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}