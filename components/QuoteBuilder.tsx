import React, { useState, useEffect } from 'react';
import { QuoteItem, CalculationResult, SolarInputData, QuoteCategory } from '../types';
import { generateInitialQuote } from '../services/quoteService';
import { ShoppingCart, Edit2, Check, Trash2, Plus, DollarSign, Package, Shield, Zap, Wrench } from 'lucide-react';

interface QuoteBuilderProps {
  input: SolarInputData;
  result: CalculationResult;
  onQuoteUpdate: (items: QuoteItem[]) => void;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ input, result, onQuoteUpdate }) => {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Initialize quote when results change
  useEffect(() => {
    const initialItems = generateInitialQuote(input, result);
    setItems(initialItems);
    onQuoteUpdate(initialItems);
  }, [result, input.batteryVoltage]); // Re-run if key calculation params change

  const handleUpdate = (id: string, field: keyof QuoteItem, value: any) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(updated);
    onQuoteUpdate(updated);
  };

  const removeItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    onQuoteUpdate(updated);
  };

  const addItem = () => {
    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      category: 'INSTALACION',
      name: 'Item Adicional',
      description: 'Descripción del item',
      quantity: 1,
      unitPrice: 0,
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=300&h=200'
    };
    const updated = [...items, newItem];
    setItems(updated);
    onQuoteUpdate(updated);
  };

  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  // Grouping for display
  const categories: {key: QuoteCategory, icon: any, label: string}[] = [
    { key: 'GENERACION', icon: Zap, label: 'Generación Solar' },
    { key: 'ELECTRONICA', icon: Zap, label: 'Electrónica de Potencia' },
    { key: 'ALMACENAMIENTO', icon: Package, label: 'Baterías' },
    { key: 'ESTRUCTURA', icon: Wrench, label: 'Estructura y Montaje' },
    { key: 'PROTECCIONES', icon: Shield, label: 'Protecciones Eléctricas' },
    { key: 'CABLEADO', icon: Zap, label: 'Conductores y Ductos' },
    { key: 'INSTALACION', icon: Wrench, label: 'Servicios e Ingeniería' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-8 py-6 flex justify-between items-center text-white">
        <div>
           <h2 className="text-2xl font-bold flex items-center gap-3">
             <ShoppingCart className="w-6 h-6 text-yellow-400" />
             Cotización Detallada
           </h2>
           <p className="text-gray-400 text-sm mt-1">Lista de materiales y presupuesto estimado</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Inversión Total Estimada</div>
          <div className="text-3xl font-bold text-yellow-400">{formatter.format(totalCost)}</div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {categories.map((cat) => {
          const catItems = items.filter(i => i.category === cat.key);
          if (catItems.length === 0) return null;

          return (
            <div key={cat.key} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <cat.icon className="w-5 h-5 text-solar-600" />
                {cat.label}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {catItems.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow relative group">
                    
                    {/* Image */}
                    <div className="w-full md:w-32 h-32 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
                       {item.imageUrl && (
                         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                       )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                       <div>
                         <div className="flex justify-between items-start">
                           <input 
                             type="text" 
                             value={item.name}
                             onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                             className="font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full"
                           />
                           <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                         <input 
                            type="text" 
                            value={item.description}
                            onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                            className="text-sm text-gray-500 w-full bg-transparent border-none p-0 focus:ring-0 mt-1"
                         />
                       </div>

                       <div className="flex flex-wrap items-end gap-6 mt-4 md:mt-0">
                         {/* Qty */}
                         <div className="flex flex-col">
                           <label className="text-[10px] uppercase text-gray-400 font-bold">Cant.</label>
                           <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => handleUpdate(item.id, 'quantity', parseFloat(e.target.value))}
                              className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-center font-medium focus:border-solar-500 outline-none"
                           />
                         </div>

                         {/* Unit Price */}
                         <div className="flex flex-col flex-1 min-w-[120px]">
                           <label className="text-[10px] uppercase text-gray-400 font-bold">Valor Unitario</label>
                           <div className="relative">
                              <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                              <input
                                  type="number"
                                  min="0"
                                  value={item.unitPrice}
                                  onChange={(e) => handleUpdate(item.id, 'unitPrice', parseFloat(e.target.value))}
                                  className="w-full bg-white border border-gray-200 rounded pl-6 pr-2 py-1 font-medium focus:border-solar-500 outline-none"
                              />
                           </div>
                         </div>

                         {/* Total */}
                         <div className="flex flex-col items-end min-w-[120px]">
                           <label className="text-[10px] uppercase text-gray-400 font-bold">Subtotal</label>
                           <span className="text-lg font-bold text-gray-800">
                             {formatter.format(item.quantity * item.unitPrice)}
                           </span>
                         </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <button 
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-solar-500 hover:text-solar-600 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" /> Agregar Item Manual
        </button>

      </div>
    </div>
  );
};