import { GoogleGenAI } from "@google/genai";
import { SolarInputData, CalculationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSolarReport = async (
  input: SolarInputData,
  result: CalculationResult
): Promise<string> => {
  const modelId = "gemini-2.5-flash";
  
  let appliancesContext = "";
  if (input.calculationMode === 'LOAD_ANALYSIS' && input.appliances.length > 0) {
    const appList = input.appliances
      .map(a => `- ${a.quantity}x ${a.name} (${a.power}W, ${a.hours}h/día)`)
      .join('\n');
    appliancesContext = `
    ANÁLISIS DE CARGA DETALLADO (LISTA DE EQUIPOS):
    ${appList}
    
    Por favor, analiza si hay equipos inductivos (motores, bombas, neveras) que requieran consideraciones especiales de pico de arranque para el inversor.
    `;
  }

  const prompt = `
    Actúa como un ingeniero senior en energías renovables. Genera un informe técnico conciso y recomendaciones basadas en los siguientes datos de un sistema solar fotovoltaico off-grid:

    DATOS DE ENTRADA:
    - Modo de Cálculo: ${input.calculationMode === 'BILL' ? 'Basado en Recibo Mensual' : 'Análisis de Carga Manual'}
    - Consumo Diario Estimado: ${(result.dailyConsumptionWh / 1000).toFixed(2)} kWh
    - Horas Sol Pico (HSP): ${input.peakSunHours} h
    - Panel Seleccionado: ${input.selectedPanel.brand} ${input.selectedPanel.model} (${input.selectedPanel.power}W)
    - Voltaje del Sistema: ${input.batteryVoltage} V
    - Días de Autonomía: ${input.autonomyDays} días
    ${appliancesContext}

    RESULTADOS TÉCNICOS CALCULADOS:
    - Generación FV Requerida: ${result.numberOfPanels} paneles de ${input.selectedPanel.power}W (Total: ${(result.numberOfPanels * input.selectedPanel.power)} Wp)
    - Inversor Recomendado: ${result.inverter.suggestedSizeW}W (${result.inverter.type})
    - Banco de Baterías: ${Math.round(result.batteryCapacityAh)} Ah a ${input.batteryVoltage}V
    - Demanda Máxima Estimada: ${result.maxPowerDemandW} W

    ESTRUCTURA DEL REPORTE (Formato Markdown):
    1. **Análisis de Viabilidad**: Evalúa si el sistema está bien equilibrado. Si hay cargas inductivas mencionadas, comenta sobre el inversor.
    2. **Especificaciones del Inversor**: Explica por qué se sugiere un inversor de ${result.inverter.suggestedSizeW}W y tipo ${result.inverter.type}. Valida si el breaker de DC sugerido (${result.inverter.suggestedBreakerAmps}A) es adecuado.
    3. **Panel Solar y Eficiencia**: Comenta brevemente sobre la calidad del panel ${input.selectedPanel.brand} seleccionado.
    4. **Banco de Baterías**: Comenta sobre la autonomía real esperada.
    5. **Recomendaciones de Instalación**: Tips sobre orientación, inclinación y cableado (menciona calibre AWG grueso para baterías).

    Tono profesional, técnico pero educativo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    
    return response.text || "No se pudo generar el reporte detallado.";
  } catch (error) {
    console.error("Error generating solar report:", error);
    return "Ocurrió un error al conectar con el asistente de IA. Por favor verifica tu conexión o clave API.";
  }
};