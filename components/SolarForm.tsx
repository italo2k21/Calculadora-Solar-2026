import React from 'react';
import { SolarInputData, CalculationMode, InverterType } from '../types';
import { Sun, Battery, Zap, Calendar, Settings, FileText, ListChecks, PanelTop, MapPin, User, Phone, Mail, Home, Coins, Calculator, Cpu } from 'lucide-react';
import { LoadCalculator } from './LoadCalculator';
import { COLOMBIAN_PANELS, COLOMBIAN_CITIES } from '../App';

interface SolarFormProps {
  data: SolarInputData;
  onChange: (data: SolarInputData) => void;
  onCalculate: () => void;
}

export const SolarForm: React.FC<SolarFormProps> = ({ data, onChange, onCalculate }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Check if the input is meant to be a number based on field names or type
    const isNumberField = ['monthlyConsumption', 'peakSunHours', 'batteryVoltage', 'autonomyDays', 'monthlyBillAmount', 'electricityRate'].includes(name) || type === 'number';

    const newValue = isNumberField ? (parseFloat(value) || 0) : value;

    // Logic for auto-calculating Consumption based on Bill Amount and Rate
    let updatedData = { ...data, [name]: newValue };

    if (name === 'monthlyBillAmount' || name === 'electricityRate') {
      const bill = name === 'monthlyBillAmount' ? newValue as number : data.monthlyBillAmount;
      const rate = name === 'electricityRate' ? newValue as number : data.electricityRate;

      if (bill > 0 && rate > 0) {
        // Auto calculate kWh: Total Bill / Rate
        updatedData.monthlyConsumption = Math.round(bill / rate);
      }
    }
    
    onChange(updatedData);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    const city = COLOMBIAN_CITIES.find(c => c.name === cityName);
    
    if (city) {
      onChange({
        ...data,
        cityName: city.name,
        peakSunHours: city.hsp
      });
    }
  };

  const handlePanelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const panelId = e.target.value;
    const selected = COLOMBIAN_PANELS.find(p => p.id === panelId);
    if (selected) {
      onChange({
        ...data,
        selectedPanel: selected
      });
    }
  };

  const setMode = (mode: CalculationMode) => {
    onChange({ ...data, calculationMode: mode });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-solar-600" />
        Configuración del Sistema
      </h2>

      {/* Mode Toggle Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
        <button
          onClick={() => setMode('BILL')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            data.calculationMode === 'BILL' 
              ? 'bg-white text-solar-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Por Recibo de Luz
        </button>
        <button
          onClick={() => setMode('LOAD_ANALYSIS')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            data.calculationMode === 'LOAD_ANALYSIS' 
              ? 'bg-white text-solar-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Análisis de Carga
        </button>
      </div>
      
      <div className="space-y-6">
        
        {/* Input Method Section */}
        {data.calculationMode === 'BILL' ? (
           <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Bill Amount */}
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-green-600" /> Valor Factura ($)
                </label>
                <input
                  type="number"
                  name="monthlyBillAmount"
                  value={data.monthlyBillAmount || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-all outline-none"
                  placeholder="Ej: 200000"
                />
               </div>

               {/* Cost per kWh */}
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-gray-500" /> Costo Unitario kWh ($)
                </label>
                <input
                  type="number"
                  name="electricityRate"
                  value={data.electricityRate || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-all outline-none"
                  placeholder="Ej: 850"
                />
               </div>
             </div>

             {/* Resulting kWh (Editable) */}
             <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
               <div className="space-y-2">
                <label className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" /> Consumo Calculado (kWh / Mes)
                </label>
                <input
                  type="number"
                  name="monthlyConsumption"
                  value={data.monthlyConsumption}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-semibold text-lg"
                  placeholder="Ej: 300"
                />
                <p className="text-xs text-blue-600">
                  Calculado automáticamente: Factura / Costo Unitario. Puedes ajustarlo manualmente si conoces el dato exacto.
                </p>
              </div>
             </div>
          </div>
        ) : (
          <LoadCalculator 
            appliances={data.appliances}
            onChange={(apps) => onChange({ ...data, appliances: apps })}
          />
        )}

        <div className="h-px bg-gray-100 my-6"></div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Ubicación y Cliente</h3>

        <div className="space-y-6">
           {/* City Selector */}
           <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" /> Ciudad / Ubicación (Colombia)
            </label>
            <div className="relative">
              <select
                name="cityName"
                value={data.cityName}
                onChange={handleCityChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-all outline-none bg-white"
              >
                {COLOMBIAN_CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Details Inputs */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> Datos del Cliente
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre Completo</label>
                 <div className="relative">
                   <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                   <input 
                      type="text" 
                      name="customerName"
                      value={data.customerName} 
                      onChange={handleChange}
                      placeholder="Ej: Juan Pérez"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-solar-500 outline-none"
                   />
                 </div>
               </div>
               <div>
                 <label className="text-xs font-medium text-gray-600 mb-1 block">Teléfono / WhatsApp</label>
                 <div className="relative">
                   <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                   <input 
                      type="text" 
                      name="customerPhone"
                      value={data.customerPhone} 
                      onChange={handleChange}
                      placeholder="+57 300..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-solar-500 outline-none"
                   />
                 </div>
               </div>
               <div>
                 <label className="text-xs font-medium text-gray-600 mb-1 block">Correo Electrónico</label>
                 <div className="relative">
                   <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                   <input 
                      type="email" 
                      name="customerEmail"
                      value={data.customerEmail} 
                      onChange={handleChange}
                      placeholder="cliente@email.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-solar-500 outline-none"
                   />
                 </div>
               </div>
               <div>
                 <label className="text-xs font-medium text-gray-600 mb-1 block">Dirección Proyecto</label>
                 <div className="relative">
                   <Home className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                   <input 
                      type="text" 
                      name="customerAddress"
                      value={data.customerAddress} 
                      onChange={handleChange}
                      placeholder="Cra 43 #..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-solar-500 outline-none"
                   />
                 </div>
               </div>
            </div>
          </div>

           {/* Panel Selector (Full Width) */}
           <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <PanelTop className="w-4 h-4 text-blue-600" /> Selección de Panel (Mercado COL)
            </label>
            <div className="relative">
              <select
                name="selectedPanel"
                value={data.selectedPanel.id}
                onChange={handlePanelChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-all outline-none appearance-none bg-white"
              >
                {COLOMBIAN_PANELS.map((panel) => (
                  <option key={panel.id} value={panel.id}>
                    {panel.brand} - {panel.model} ({panel.power}W)
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">
               Tecnología: <span className="font-semibold text-solar-600">{data.selectedPanel.type}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Horas Sol (Auto-filled but editable) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Sun className="w-4 h-4 text-solar-500" /> Horas Sol Pico (HSP)
            </label>
            <input
              type="number"
              name="peakSunHours"
              value={data.peakSunHours}
              onChange={handleChange}
              step="0.1"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-all outline-none bg-gray-50"
              placeholder="Ej: 5.0"
            />
          </div>

          {/* Inverter Type Selector (New) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" /> Tipo de Inversor
            </label>
            <select
              name="inverterType"
              value={data.inverterType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-all outline-none bg-white"
            >
              <option value="OFF_GRID">Off-Grid (Aislado con Baterías)</option>
              <option value="HYBRID">Híbrido (Red + Baterías)</option>
              <option value="ON_GRID">On-Grid (Inyección a Red)</option>
            </select>
          </div>

          {/* Battery Voltage */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Battery className="w-4 h-4 text-green-600" /> Voltaje de Baterías
            </label>
            <select
              name="batteryVoltage"
              value={data.batteryVoltage}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-all outline-none"
            >
              <option value={12}>12V (Pequeño)</option>
              <option value={24}>24V (Mediano)</option>
              <option value={48}>48V (Residencial)</option>
            </select>
          </div>

          {/* Autonomy */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" /> Días de Autonomía
            </label>
            <input
              type="number"
              name="autonomyDays"
              value={data.autonomyDays}
              onChange={handleChange}
              min="0"
              max="7"
              step="0.5"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onCalculate}
          className="w-full bg-gradient-to-r from-solar-500 to-solar-600 hover:from-solar-600 hover:to-solar-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-transform active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Zap className="w-5 h-5 fill-current" />
          {data.calculationMode === 'BILL' ? 'Calcular Sistema' : 'Analizar Carga y Calcular'}
        </button>
      </div>
    </div>
  );
};