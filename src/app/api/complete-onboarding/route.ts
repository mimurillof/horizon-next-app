import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    console.log('📝 [COMPLETE-ONBOARDING] Recibido:', { user_id });

    // Validar datos requeridos
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id es requerido' },
        { status: 400 }
      );
    }

    // Actualizar el campo has_completed_onboarding
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ has_completed_onboarding: true })
      .eq('user_id', user_id)
      .select();

    if (error) {
      console.error('❌ [COMPLETE-ONBOARDING] Error al actualizar:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [COMPLETE-ONBOARDING] Onboarding completado:', data);

    return NextResponse.json({
      success: true,
      message: 'Onboarding completado exitosamente',
      data: data[0],
    });
  } catch (error) {
    console.error('❌ [COMPLETE-ONBOARDING] Error inesperado:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
