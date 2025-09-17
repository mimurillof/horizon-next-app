import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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

    // Verificar que el portafolio pertenece al usuario
    const { data: portfolio, error: portfolioError } = await supabaseAdmin
      .from('portfolios')
      .select('portfolio_id, user_id')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (portfolioError || !portfolio) {
      console.error('❌ [ADD-ASSET] Portafolio no encontrado o no pertenece al usuario:', portfolioError);
      return NextResponse.json(
        { success: false, error: 'Portafolio no encontrado o no autorizado' },
        { status: 403 }
      );
    }

    // Insertar activo en la base de datos
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

    console.log('✅ [ADD-ASSET] Activo agregado exitosamente:', asset);

    return NextResponse.json({
      success: true,
      data: asset,
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