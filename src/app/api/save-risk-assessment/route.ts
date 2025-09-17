import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del request
    const { 
      user_id,
      portfolio_id, 
      purpose, 
      time_horizon, 
      risk_reaction 
    } = await request.json();

    // Validaciones básicas
    if (!user_id || !portfolio_id || !purpose || !time_horizon || !risk_reaction) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son obligatorios (user_id, portfolio_id, purpose, time_horizon, risk_reaction)' },
        { status: 400 }
      );
    }

    console.log('📝 [SAVE-RISK-ASSESSMENT] Guardando evaluación para usuario:', user_id);
    console.log('📝 [SAVE-RISK-ASSESSMENT] Datos:', { portfolio_id, purpose, time_horizon, risk_reaction });

    // Verificar que el portafolio pertenece al usuario
    const { data: portfolio, error: portfolioError } = await supabaseAdmin
      .from('portfolios')
      .select('portfolio_id, user_id')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (portfolioError || !portfolio) {
      console.error('❌ [SAVE-RISK-ASSESSMENT] Portafolio no encontrado o no pertenece al usuario:', portfolioError);
      return NextResponse.json(
        { success: false, error: 'Portafolio no encontrado o no autorizado' },
        { status: 403 }
      );
    }

    // Mapear valores para asegurar compatibilidad con ENUMs
    const purposeMapping: { [key: string]: string } = {
      'Jubilación': 'retirement',
      'Comprar una casa': 'house_purchase',
      'Educación de hijos': 'education',
      'Crecimiento a largo plazo': 'long_term_growth',
      'Generar ingresos pasivos': 'passive_income',
      'Otro': 'other'
    };

    const timeHorizonMapping: { [key: string]: string } = {
      'Trader (Corto Plazo)': 'short_term_trader',
      'Holder (Largo Plazo)': 'long_term_holder'
    };

    const riskReactionMapping: { [key: string]: string } = {
      'A': 'high_aversion',           // "Entraría en pánico, vendería inmediatamente..."
      'B': 'moderate_aversion',       // "Me sentiría muy preocupado(a)..."  
      'C': 'moderate_tolerance',      // "Aunque no me gustaría ver la pérdida..."
      'D': 'high_tolerance'           // "Lo vería como una oportunidad..."
    };

    const mappedPurpose = purposeMapping[purpose] || purpose;
    const mappedTimeHorizon = timeHorizonMapping[time_horizon] || time_horizon;
    const mappedRiskReaction = riskReactionMapping[risk_reaction] || risk_reaction;

    console.log('📝 [SAVE-RISK-ASSESSMENT] Valores mapeados:', {
      purpose: `"${purpose}" -> "${mappedPurpose}"`,
      time_horizon: `"${time_horizon}" -> "${mappedTimeHorizon}"`,
      risk_reaction: `"${risk_reaction}" -> "${mappedRiskReaction}"`
    });

    // Validar que todos los valores fueron mapeados correctamente
    if (!['retirement', 'house_purchase', 'education', 'long_term_growth', 'passive_income', 'other'].includes(mappedPurpose)) {
      console.error('❌ [SAVE-RISK-ASSESSMENT] Valor de purpose no válido:', mappedPurpose);
      return NextResponse.json(
        { success: false, error: `Valor de propósito no válido: ${purpose}` },
        { status: 400 }
      );
    }

    if (!['short_term_trader', 'long_term_holder'].includes(mappedTimeHorizon)) {
      console.error('❌ [SAVE-RISK-ASSESSMENT] Valor de time_horizon no válido:', mappedTimeHorizon);
      return NextResponse.json(
        { success: false, error: `Valor de horizonte temporal no válido: ${time_horizon}` },
        { status: 400 }
      );
    }

    if (!['high_aversion', 'moderate_aversion', 'moderate_tolerance', 'high_tolerance'].includes(mappedRiskReaction)) {
      console.error('❌ [SAVE-RISK-ASSESSMENT] Valor de risk_reaction no válido:', mappedRiskReaction);
      return NextResponse.json(
        { success: false, error: `Valor de reacción al riesgo no válido: ${risk_reaction}` },
        { status: 400 }
      );
    }

    // Verificar si ya existe una evaluación para este portafolio y actualizarla
    const { data: existingAssessment } = await supabaseAdmin
      .from('risk_assessments')
      .select('assessment_id')
      .eq('portfolio_id', portfolio_id)
      .single();

    let result;
    if (existingAssessment) {
      // Actualizar evaluación existente
      const { data: updatedAssessment, error: updateError } = await supabaseAdmin
        .from('risk_assessments')
        .update({
          purpose: mappedPurpose,
          time_horizon: mappedTimeHorizon,
          risk_reaction: mappedRiskReaction
        })
        .eq('assessment_id', existingAssessment.assessment_id)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ [SAVE-RISK-ASSESSMENT] Error al actualizar evaluación:', updateError);
        return NextResponse.json(
          { success: false, error: `Error al actualizar evaluación: ${updateError.message}` },
          { status: 500 }
        );
      }

      result = updatedAssessment;
      console.log('✅ [SAVE-RISK-ASSESSMENT] Evaluación actualizada exitosamente:', result);
    } else {
      // Crear nueva evaluación
      const { data: newAssessment, error: insertError } = await supabaseAdmin
        .from('risk_assessments')
        .insert({
          portfolio_id: parseInt(portfolio_id),
          purpose: mappedPurpose,
          time_horizon: mappedTimeHorizon,
          risk_reaction: mappedRiskReaction
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('❌ [SAVE-RISK-ASSESSMENT] Error al insertar evaluación:', insertError);
        return NextResponse.json(
          { success: false, error: `Error al guardar evaluación: ${insertError.message}` },
          { status: 500 }
        );
      }

      result = newAssessment;
      console.log('✅ [SAVE-RISK-ASSESSMENT] Evaluación creada exitosamente:', result);
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Evaluación de riesgo guardada exitosamente'
    });

  } catch (error) {
    console.error('❌ [SAVE-RISK-ASSESSMENT] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}