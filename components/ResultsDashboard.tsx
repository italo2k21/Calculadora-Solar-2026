import React, { useState } from 'react';
import { SolarInputData, CalculationResult, ChartDataPoint, QuoteItem } from '../types';
import { generateSolarReport } from '../services/geminiService';
import { generatePDFReport } from '../services/pdfGenerator';
import { QuoteBuilder } from './QuoteBuilder';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Cpu, BatteryCharging, Zap, Grid, Lightbulb, Loader2, Sparkles, Download, ArrowDownToLine, Info, MapPin, Calendar, PanelTop, Settings, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResultsDashboardProps {
  input: SolarInputData;
  result: CalculationResult;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ input, result }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  // Mock data for chart visualization based on peak sun hours roughly centered around noon
  const generateChartData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const hourlyConsumption = result.dailyConsumptionWh / 24;
    
    for (let i = 0; i < 24; i++) {
      let productionFactor = 0;
      // Simple bell curve simulation for sun
      if (i >= 6 && i <= 18) {
        productionFactor = Math.sin(((i - 6) * Math.PI) / 12); 
      }
      
      const estimatedHourlyProduction = (result.estimatedGenerationDailyWh * productionFactor) / (input.peakSunHours * 1.5); // normalization factor

      data.push({
        hour: `${i}:00`,
        production: Math.max(0, Math.round(estimatedHourlyProduction)),
        consumption: Math.round(hourlyConsumption)
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const handleAskAi = async () => {
    setIsLoadingAi(true);
    const report = await generateSolarReport(input, result);
    setAiReport(report);
    setIsLoadingAi(false);
  };

  const handleExportJson = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      inputs: input,
      results: result,
      quote: quoteItems,
      aiAnalysis: aiReport || "Not generated"
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-calc-report-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    generatePDFReport(input, result, aiReport, quoteItems);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Resultados del Sistema</h2>
        <div className="flex gap-2">
            <button 
                onClick={handleExportJson}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors border border-gray-200"
            >
                <ArrowDownToLine className="w-4 h-4" /> JSON
            </button>
            <button 
                onClick={handleExportPdf}
                className="flex items-center gap-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
                <FileText className="w-4 h-4" /> Descargar Oferta PDF
            </button>
        </div>
      </div>

      {/* New: Project Tech Sheet / Parameters Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-700">Ficha Técnica del Proyecto</h3>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider flex items-center gap-1">
                   <MapPin className="w-3 h-3" /> Ubicación
                </span>
                <span className="font-medium text-gray-900">{input.cityName}</span>
                <span className="text-xs text-gray-500">HSP: {input.peakSunHours}h</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider flex items-center gap-1">
                   <PanelTop className="w-3 h-3" /> Panel Ref.
                </span>
                <span className="font-medium text-gray-900">{input.selectedPanel.brand}</span>
                <span className="text-xs text-gray-500">{input.selectedPanel.power}W - {input.selectedPanel.model}</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider flex items-center gap-1">
                   <BatteryCharging className="w-3 h-3" /> Voltaje
                </span>
                <span className="font-medium text-gray-900">{input.batteryVoltage} VDC</span>
                <span className="text-xs text-gray-500">Sistema Off-Grid</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider flex items-center gap-1">
                   <Calendar className="w-3 h-3" /> Autonomía
                </span>
                <span className="font-medium text-gray-900">{input.autonomyDays} Día(s)</span>
                <span className="text-xs text-gray-500">Respaldo batería</span>
            </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panels Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-solar-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Grid className="w-24 h-24 text-solar-500" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Paneles Solares</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-800">{result.numberOfPanels}</span>
            <span className="text-gray-600 font-medium">unidades</span>
          </div>
          <div className="mt-2 text-sm">
             <p className="font-bold text-gray-800">{input.selectedPanel.brand}</p>
             <p className="text-gray-500">{input.selectedPanel.model} ({input.selectedPanel.power}W)</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
             <span className="text-gray-600">Potencia Array:</span>
             <span className="font-bold text-solar-600">{(result.numberOfPanels * input.selectedPanel.power / 1000).toFixed(2)} kWp</span>
          </div>
        </div>

        {/* Battery Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-nature-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BatteryCharging className="w-24 h-24 text-nature-500" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Banco de Baterías</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-800">{Math.round(result.batteryCapacityAh)}</span>
            <span className="text-gray-600 font-medium">Ah</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            @ {input.batteryVoltage}V ({input.autonomyDays} días autonomía)
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
             <span className="text-gray-600">Almacenamiento:</span>
             <span className="font-bold text-nature-600">{((result.batteryCapacityAh * input.batteryVoltage) / 1000).toFixed(2)} kWh</span>
          </div>
        </div>

        {/* Inverter Card Detailed */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cpu className="w-24 h-24 text-blue-500" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Inversor</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800">{result.inverter.suggestedSizeW}</span>
            <span className="text-gray-600 font-medium">W</span>
          </div>
          <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-1">
             {result.inverter.type}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
             <div className="flex justify-between">
                <span className="text-gray-600">Entrada DC:</span>
                <span className="font-medium text-gray-900">{result.inverter.inputVoltage}V</span>
             </div>
             <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-1"><Info className="w-3 h-3"/> Breaker DC:</span>
                <span className="font-medium text-gray-900">{result.inverter.suggestedBreakerAmps}A</span>
             </div>
             <div className="flex justify-between">
                <span className="text-gray-600">Eficiencia Est.:</span>
                <span className="font-medium text-gray-900">{result.inverter.efficiency * 100}%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Quote Builder Component - Financials */}
      <QuoteBuilder input={input} result={result} onQuoteUpdate={setQuoteItems} />

      {/* Charts */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-solar-500" />
          Estimación: Producción vs Consumo ({input.calculationMode === 'BILL' ? 'Promedio' : 'Carga Manual'})
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} unit=" W" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="production" 
                name="Producción Solar" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorProd)" 
              />
              <Area 
                type="monotone" 
                dataKey="consumption" 
                name="Consumo Estimado" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorCons)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl overflow-hidden text-white">
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Asistente Inteligente Gemini
              </h3>
              <p className="text-gray-400 mt-1">Obtén un análisis técnico detallado y recomendaciones personalizadas.</p>
            </div>
            
            {!aiReport && (
              <button 
                onClick={handleAskAi}
                disabled={isLoadingAi}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingAi ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analizando Carga...</>
                ) : (
                  <><Lightbulb className="w-5 h-5" /> Analizar con IA</>
                )}
              </button>
            )}
          </div>

          {isLoadingAi && !aiReport && (
             <div className="py-12 flex flex-col items-center justify-center text-gray-400">
               <Loader2 className="w-10 h-10 animate-spin mb-4 text-solar-400" />
               <p>Generando reporte técnico...</p>
             </div>
          )}

          {aiReport && (
            <div className="bg-white/5 rounded-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="prose prose-invert max-w-none prose-headings:text-solar-400 prose-strong:text-white prose-p:text-gray-300">
                <ReactMarkdown>{aiReport}</ReactMarkdown>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleAskAi}
                  className="text-sm text-gray-400 hover:text-white underline underline-offset-4"
                >
                  Regenerar análisis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};