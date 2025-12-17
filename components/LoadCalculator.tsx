import React from 'react';
import { Appliance } from '../types';
import { Trash2, Plus, Monitor, Tv, Wifi, Utensils, Zap } from 'lucide-react';

interface LoadCalculatorProps {
  appliances: Appliance[];
  onChange: (appliances: Appliance[]) => void;
}

const COMMON_APPLIANCES = [
  { name: 'Bombillo LED', power: 10, icon: '💡' },
  { name: 'Cargador Celular', power: 10, icon: '📱' },
  { name: 'Refrigerador/Nevera', power: 150, icon: '❄️' },
  { name: 'Televisor LED', power: 80, icon: '📺' },
  { name: 'Router WiFi', power: 10, icon: '📶' },
  { name: 'Laptop', power: 60, icon: '💻' },
  { name: 'Ventilador', power: 50, icon: '💨' },
  { name: 'Lavadora', power: 500, icon: '🧺' },
  { name: 'Aire Acondicionado (9000BTU)', power: 1000, icon: '❄️' },
  { name: 'Microondas', power: 1000, icon: '🍲' },
  { name: 'Bomba de Agua (0.5HP)', power: 375, icon: '💧' },
];

export const LoadCalculator: React.FC<LoadCalculatorProps> = ({ appliances, onChange }) => {

  const addAppliance = (template?: typeof COMMON_APPLIANCES[0]) => {
    const newAppliance: Appliance = {
      id: crypto.randomUUID(),
      name: template ? template.name : 'Nuevo Dispositivo',
      power: template ? template.power : 100,
      quantity: 1,
      hours: template?.name.includes('Nevera') ? 24 : 4, // Auto-set 24h for fridge
    };
    onChange([...appliances, newAppliance]);
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    const updated = appliances.map(app => {
      if (app.id === id) {
        return { ...app, [field]: value };
      }
      return app;
    });
    onChange(updated);
  };

  const removeAppliance = (id: string) => {
    onChange(appliances.filter(app => app.id !== id));
  };

  const totalDailyWh = appliances.reduce((acc, app) => acc + (app.power * app.quantity * app.hours), 0);
  const totalInstantWatts = appliances.reduce((acc, app) => acc + (app.power * app.quantity), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-solar-600" />
          Inventario de Cargas
        </h3>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase font-semibold">Consumo Diario</div>
          <div className="text-xl font-bold text-solar-600">{totalDailyWh.toLocaleString()} Wh</div>
        </div>
      </div>

      {/* Preset Buttons - Now showing all items for better access */}
      <div className="flex flex-wrap gap-2 mb-4">
        {COMMON_APPLIANCES.map((item) => (
          <button
            key={item.name}
            onClick={() => addAppliance(item)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-gray-200"
          >
            <span className="text-base">{item.icon}</span> {item.name}
          </button>
        ))}
        <button
            onClick={() => addAppliance()}
            className="text-xs bg-solar-100 hover:bg-solar-200 text-solar-800 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 font-medium border border-solar-200"
        >
            <Plus className="w-3 h-3" /> Otro
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium">Dispositivo</th>
              <th className="px-4 py-3 font-medium w-24">Watts (W)</th>
              <th className="px-4 py-3 font-medium w-20">Cant.</th>
              <th className="px-4 py-3 font-medium w-24">Horas/Día</th>
              <th className="px-4 py-3 font-medium w-24">Total Wh</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {appliances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">
                  No hay dispositivos. Agrega uno arriba haciendo clic en los botones.
                </td>
              </tr>
            ) : (
              appliances.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={app.name}
                      onChange={(e) => updateAppliance(app.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-gray-800"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      value={app.power}
                      onChange={(e) => updateAppliance(app.id, 'power', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center focus:border-solar-500 outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="1"
                      value={app.quantity}
                      onChange={(e) => updateAppliance(app.id, 'quantity', parseFloat(e.target.value) || 1)}
                      className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center focus:border-solar-500 outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                     <input
                      type="number"
                      min="0"
                      max="24"
                      value={app.hours}
                      onChange={(e) => updateAppliance(app.id, 'hours', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center focus:border-solar-500 outline-none"
                    />
                  </td>
                  <td className="px-4 py-2 font-semibold text-gray-600">
                    {(app.power * app.quantity * app.hours).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => removeAppliance(app.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {appliances.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold text-gray-700">
                  <tr>
                      <td colSpan={4} className="px-4 py-3 text-right">Total Diario Estimado:</td>
                      <td className="px-4 py-3 text-solar-600">{totalDailyWh.toLocaleString()} Wh</td>
                      <td></td>
                  </tr>
                  <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-xs text-gray-500 font-normal">Carga Máxima Simultánea (Inv):</td>
                      <td className="px-4 py-2 text-xs text-gray-500">{totalInstantWatts.toLocaleString()} W</td>
                      <td></td>
                  </tr>
              </tfoot>
          )}
        </table>
      </div>
      <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2">
         <Zap className="w-4 h-4 text-blue-500 flex-shrink-0" />
         Consejo: Ingresa la potencia real (W) que aparece en la etiqueta trasera de tus equipos para mayor precisión.
      </p>
    </div>
  );
};