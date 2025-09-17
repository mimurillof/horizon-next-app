import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del request
    const { user_id, portfolio_name, description = '' } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id es requerido' },
        { status: 400 }
      );
    }

    if (!portfolio_name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre del portafolio es obligatorio' },
        { status: 400 }
      );
    }

    console.log('📝 [CREATE-PORTFOLIO] Creando portafolio para usuario:', user_id);
    console.log('📝 [CREATE-PORTFOLIO] Datos:', { portfolio_name, description });

    // Insertar portafolio en la base de datos
    const { data: portfolio, error: portfolioError } = await supabaseAdmin
      .from('portfolios')
      .insert({
        user_id: user_id,
        portfolio_name: portfolio_name.trim(),
        description: description.trim() || null
      })
      .select('*')
      .single();

    if (portfolioError) {
      console.error('❌ [CREATE-PORTFOLIO] Error al insertar portafolio:', portfolioError);
      return NextResponse.json(
        { success: false, error: `Error al crear portafolio: ${portfolioError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ [CREATE-PORTFOLIO] Portafolio creado exitosamente:', portfolio);

    return NextResponse.json({
      success: true,
      data: portfolio,
      message: 'Portafolio creado exitosamente'
    });

  } catch (error) {
    console.error('❌ [CREATE-PORTFOLIO] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}