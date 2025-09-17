import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { user_id, first_name, last_name, email, birth_date, gender } = await request.json();
    
    // Mapear valores de género para asegurar compatibilidad con ENUM
    const genderMapping: { [key: string]: string } = {
      'male': 'male',
      'female': 'female', 
      'other': 'other',
      'prefer-not-to-say': 'prefer_not_to_say',
      'prefer_not_to_say': 'prefer_not_to_say'
    };
    
    const mappedGender = gender ? genderMapping[gender] || null : null;
    
    console.log('API: Insertando usuario en tabla users:', {
      user_id, first_name, last_name, email, birth_date, 
      gender_original: gender,
      gender_mapped: mappedGender
    });

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          user_id,
          first_name,
          last_name,
          email,
          password_hash: 'handled_by_supabase_auth',
          birth_date: birth_date || null,
          gender: mappedGender,
        }
      ])
      .select();

    if (error) {
      console.error('Error en API al insertar usuario:', error);
      return NextResponse.json(
        { 
          message: 'Error al crear perfil de usuario',
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log('✅ Usuario insertado exitosamente via API:', data);
    return NextResponse.json({ success: true, user: data[0] });

  } catch (error) {
    console.error('Error general en API create-user:', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}