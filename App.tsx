import React, { useState } from 'react';
import { Sun } from 'lucide-react';
import { SolarForm } from './components/SolarForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { SolarInputData, CalculationResult, CalculationStatus, InverterDetails, SolarPanel } from './types';

// Mercado Colombiano Panels Catalog - Updated with Modern High Power Modules
export const COLOMBIAN_PANELS: SolarPanel[] = [
  { id: 'trina-700', brand: 'Trina Solar', model: 'Vertex N Gen2 (Bifacial)', power: 700, type: 'Monocristalino N-Type' },
  { id: 'cs-665', brand: 'Canadian Solar', model: 'HiKu7 Mono PERC', power: 665, type: 'Monocristalino' },
  { id: 'jinko-625', brand: 'Jinko Solar', model: 'Tiger Neo N-Type', power: 625, type: 'Monocristalino N-Type' },
  { id: 'risen-600', brand: 'Risen', model: 'Titan Series', power: 600, type: 'Monocristalino' },
  { id: 'trina-580', brand: 'Trina Solar', model: 'Vertex S+', power: 580, type: 'Monocristalino' },
  { id: 'longi-570', brand: 'Longi', model: 'Hi-MO 6 Scientist', power: 570, type: 'Monocristalino' },
  { id: 'cs-550', brand: 'Canadian Solar', model: 'HiKu6 Mono PERC', power: 550, type: 'Monocristalino' },
  { id: 'jinko-470', brand: 'Jinko Solar', model: 'Tiger Neo', power: 470, type: 'Monocristalino' },
  { id: 'era-400', brand: 'Era Solar', model: 'Half-Cut Cell', power: 400, type: 'Monocristalino' }, 
];

// Average Peak Sun Hours (HSP) for major Colombian cities
export const COLOMBIAN_CITIES = [
  { name: 'Bogotá D.C.', hsp: 4.2 },
  { name: 'Medellín', hsp: 4.5 },
  { name: 'Cali', hsp: 4.8 },
  { name: 'Barranquilla', hsp: 5.6 },
  { name: 'Cartagena', hsp: 5.4 },
  { name: 'Bucaramanga', hsp: 4.9 },
  { name: 'Pereira', hsp: 4.4 },
  { name: 'Santa Marta', hsp: 5.8 },
  { name: 'Cúcuta', hsp: 5.1 },
  { name: 'Villavicencio', hsp: 4.6 },
  { name: 'Ibagué', hsp: 4.5 },
  { name: 'Riohacha (La Guajira)', hsp: 6.0 }, // High potential
  { name: 'Pasto', hsp: 3.8 },
  { name: 'Manizales', hsp: 4.2 },
  { name: 'Montería', hsp: 5.2 },
  { name: 'Valledupar', hsp: 5.7 },
  { name: 'Personalizado', hsp: 4.5 }
];

const INITIAL_DATA: SolarInputData = {
  calculationMode: 'BILL',
  cityName: 'Medellín',
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  customerEmail: '',
  monthlyBillAmount: 250000, // Default estimate COP
  electricityRate: 850, // Default estimate COP/kWh
  monthlyConsumption: 294, // Calculated roughly
  peakSunHours: 4.5,
  selectedPanel: COLOMBIAN_PANELS[6], // Default to Canadian Solar 550W (Standard/Popular)
  batteryVoltage: 24,
  autonomyDays: 1,
  systemEfficiency: 0.75,
  inverterType: 'OFF_GRID',
  appliances: []
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<SolarInputData>(INITIAL_DATA);
  const [status, setStatus] = useState<CalculationStatus>(CalculationStatus.IDLE);
  const [results, setResults] = useState<CalculationResult | null>(null);

  const calculateSystem = () => {
    const { 
      calculationMode,
      monthlyConsumption, 
      peakSunHours, 
      selectedPanel, 
      batteryVoltage, 
      autonomyDays,
      systemEfficiency,
      inverterType,
      appliances
    } = formData;

    // 1. Determine Daily Consumption (Wh) based on mode
    let dailyConsumptionWh = 0;
    let maxPowerDemandW = 0;

    if (calculationMode === 'LOAD_ANALYSIS') {
      // Sum individual appliances
      dailyConsumptionWh = appliances.reduce((acc, app) => acc + (app.power * app.quantity * app.hours), 0);
      
      // Calculate max power demand
      maxPowerDemandW = appliances.reduce((acc, app) => acc + (app.power * app.quantity), 0);
      maxPowerDemandW = Math.max(maxPowerDemandW, 500); // Minimum 500W baseline
      
    } else {
      // Bill mode
      dailyConsumptionWh = (monthlyConsumption * 1000) / 30;
      maxPowerDemandW = dailyConsumptionWh / 4; 
    }

    // 2. Required Generation
    const requiredGenerationWh = dailyConsumptionWh / systemEfficiency;

    // 3. Total PV Power Needed (W)
    const totalPowerNeededW = requiredGenerationWh / peakSunHours;

    // 4. Number of Panels (Using specific panel wattage)
    const numberOfPanels = Math.max(1, Math.ceil(totalPowerNeededW / selectedPanel.power));

    // 5. Inverter Calculation Detailed
    const suggestedInverterSize = Math.ceil((maxPowerDemandW * 1.25) / 100) * 100;
    
    // Determine Inverter Type String based on Selection
    let inverterTypeLabel = "";
    switch (inverterType) {
      case 'ON_GRID':
        inverterTypeLabel = "Grid-Tie (Conexión a Red)";
        break;
      case 'HYBRID':
        inverterTypeLabel = "Híbrido Inteligente (Red + Batería)";
        break;
      case 'OFF_GRID':
      default:
        inverterTypeLabel = "Off-Grid Onda Pura (Aislado)";
        break;
    }

    const inverterEfficiency = 0.92;
    // Calculate DC Breaker: Watts / Voltage * 1.25 safety
    const maxDcCurrent = suggestedInverterSize / batteryVoltage;
    const suggestedBreakerAmps = Math.ceil((maxDcCurrent * 1.25) / 10) * 10; // Round to nearest 10

    const inverterDetails: InverterDetails = {
      suggestedSizeW: suggestedInverterSize,
      type: inverterTypeLabel,
      inputVoltage: batteryVoltage,
      suggestedBreakerAmps: suggestedBreakerAmps,
      efficiency: inverterEfficiency
    };

    // 6. Battery Bank Capacity (Ah)
    // If On-Grid is selected, technically battery is 0, but for 'Hybrid' or user preference we keep calculation.
    // If explicitly ON_GRID, we could set autonomy to 0, but let's calculate based on autonomyDays input.
    const depthOfDischarge = 0.5;
    const batteryCapacityAh = (dailyConsumptionWh * autonomyDays) / (batteryVoltage * depthOfDischarge);

    setResults({
      dailyConsumptionWh,
      maxPowerDemandW,
      numberOfPanels,
      inverter: inverterDetails,
      batteryCapacityAh,
      estimatedGenerationDailyWh: numberOfPanels * selectedPanel.power * peakSunHours * systemEfficiency
    });

    setStatus(CalculationStatus.CALCULATED);
    
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-solar-500 rounded-lg flex items-center justify-center shadow-lg shadow-solar-200">
              <Sun className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">SolarCalc <span className="text-solar-600">AI</span></h1>
          </div>
          <div className="text-sm font-medium text-gray-500 hidden sm:block">
            Dimensionamiento Fotovoltaico Profesional (Colombia)
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Section - Widened from col-span-5 to col-span-6 */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Calcula tu Energía</h2>
              <p className="text-gray-600">
                Selecciona equipos disponibles en el mercado y dimensiona tu sistema solar ideal.
              </p>
            </div>
            <SolarForm 
              data={formData} 
              onChange={setFormData} 
              onCalculate={calculateSystem} 
            />
          </div>

          {/* Results Section - Adjusted from col-span-7 to col-span-6 to balance grid */}
          <div className="lg:col-span-6" id="results-section">
            {status === CalculationStatus.IDLE ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center h-full flex flex-col justify-center items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Sun className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Esperando datos</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Completa el formulario y selecciona tu panel solar preferido para ver el análisis de IA.
                </p>
              </div>
            ) : (
              results && <ResultsDashboard input={formData} result={results} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;