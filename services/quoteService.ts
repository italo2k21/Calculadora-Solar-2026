import { CalculationResult, SolarInputData, QuoteItem, QuoteCategory } from "../types";

// Helper for images (Hyper-realistic technical solar equipment representations)
const IMAGES = {
  // Solar Panels (Technical Monocrystalline Look)
  PANEL: "https://image.made-in-china.com/2f0j00UZuqiabrnyod/Jinko-Tiger-Neo-Bifacial-Solar-Panel-615-620-635-Watts-N-Type-PV-Modules.jpg",
  
  // Inverter (Industrial White Box / Power Electronics style)
  INVERTER_OFFGRID: "https://www.emergente.com.co/wp-content/uploads/2024/11/Inversor-Off-Grid-Growatt-SPF-3000TL-LVM-24V.webp",
  INVERTER_ONGRID: "https://www.ecozaque.com/wp-content/uploads/2025/10/ph11-eu-001-600x600.jpg", 
  INVERTER_HYBRID: "https://www.ecogreensolar.co/wp-content/uploads/2024/11/Inversor-Hibrido-Must-4000W-48V-PV3300-Fase-Dividida-Ecogreensolar-02.webp",
  
  // Controller (MPPT - Digital Screen Electronics)
  CONTROLLER: "https://www.emergente.com.co/wp-content/uploads/2024/07/Controlador-Regulador-De-Carga-MPPT-de-20A-1.jpg", 
  
  // Battery (Bank of Batteries / Technical Storage)
  BATTERY: "https://cosostenible.com/wp-content/uploads/2025/07/varias-baterias-de-litio-1024x576.png",
  
  // Structure (Aluminum Mounting Rails / Roof Hooks)
  STRUCTURE: "https://selfersac.com.pe/wp-content/uploads/2023/11/accesorios.png",
  
  // Breakers (DIN Rail Circuit Breakers close up)
  PROTECTION: "https://cdn.autosolar.co/images/7102527/dps-solar-dc-2p-600vdc-2040ka-moreday.jpg",
  PROTECTION_1: "https://www.solar4rvs.com.au/assets/full/Noa-84453.png?20230529192912"
  
  // Box (Distribution Board / Combiner Box)
  BOX: "https://m.media-amazon.com/images/I/71lplr1DvOL._AC_SL1500_.jpg",
  
  // Cable (Copper Wire Spools / Technical Wiring)
  CABLE: "https://m.media-amazon.com/images/I/717imcxp-VL.jpg",
  CABLE_1: "https://www.sunrichenergy.com/cdn/shop/files/Sunrich_Energy_Inverter_Battery_Cables_2.jpg?v=1721716195",

  // Grounding (Copper Rods / Earthing)
  GROUNDING: "https://transequipos.com/wp-content/uploads/2024/08/importancia-sistema-puesta-tierra.jpg",
  
  // Labor (Technical Installer with Safety Gear)
  LABOR: "https://unies.edu.co/wp-content/uploads/2021/10/ENERGIAS-LIMPIAS-768x576.png"
};

export const generateInitialQuote = (input: SolarInputData, result: CalculationResult): QuoteItem[] => {
  const items: QuoteItem[] = [];
  
  // 1. Paneles Solares
  items.push({
    id: 'panel-main',
    category: 'GENERACION',
    name: `Panel Solar ${input.selectedPanel.brand} ${input.selectedPanel.power}W`,
    description: `${input.selectedPanel.type} - Alta Eficiencia - Certificado RETIE`,
    quantity: result.numberOfPanels,
    unitPrice: 350000, // Precio estimado base COP
    imageUrl: IMAGES.PANEL
  });

  // 2. Inversor
  let inverterImage = IMAGES.INVERTER_OFFGRID;
  let inverterDesc = `Capacidad ${result.inverter.suggestedSizeW}W - Onda Pura`;
  
  if (input.inverterType === 'ON_GRID') {
      inverterImage = IMAGES.INVERTER_ONGRID;
      inverterDesc = `Grid-Tie ${result.inverter.suggestedSizeW}W - Conexión a Red - Monitoreo WiFi`;
  } else if (input.inverterType === 'HYBRID') {
      inverterImage = IMAGES.INVERTER_HYBRID;
      inverterDesc = `Híbrido ${result.inverter.suggestedSizeW}W - Gestión Inteligente Red/Batería`;
  }

  items.push({
    id: 'inverter-main',
    category: 'ELECTRONICA',
    name: `Inversor ${result.inverter.type}`,
    description: inverterDesc,
    quantity: 1,
    unitPrice: result.inverter.suggestedSizeW * 950, 
    imageUrl: inverterImage
  });

  // 3. Controlador de Carga
  // Solo se necesita si NO es Híbrido (los híbridos traen MPPT interno) y NO es On-Grid (On-grid es directo)
  // Pero si es OFF_GRID tradicional, necesitamos controlador.
  if (input.inverterType === 'OFF_GRID' && !result.inverter.type.toLowerCase().includes('híbrido')) {
    const controllerAmps = Math.ceil((result.numberOfPanels * input.selectedPanel.power) / input.batteryVoltage);
    items.push({
      id: 'controller',
      category: 'ELECTRONICA',
      name: `Controlador MPPT ${controllerAmps}A`,
      description: `Eficiencia 98% - Pantalla LCD - ${input.batteryVoltage}V Auto`,
      quantity: 1,
      unitPrice: 450000,
      imageUrl: IMAGES.CONTROLLER
    });
  }

  // 4. Baterías
  // On-Grid usualmente no lleva baterías, pero dejaremos el cálculo si el usuario puso autonomía > 0
  if (input.inverterType !== 'ON_GRID' || input.autonomyDays > 0) {
    const batteryBlockAh = 150; 
    const totalWhStorage = result.batteryCapacityAh * input.batteryVoltage;
    const blockWh = 12 * batteryBlockAh;
    const numBatteries = Math.max(1, Math.ceil(totalWhStorage / blockWh));

    items.push({
      id: 'battery-bank',
      category: 'ALMACENAMIENTO',
      name: `Batería Gel Ciclo Profundo 12V ${batteryBlockAh}Ah`,
      description: 'Tecnología VRLA - Libre Mantenimiento - Vida útil 5-7 años',
      quantity: numBatteries,
      unitPrice: 950000,
      imageUrl: IMAGES.BATTERY
    });
  }

  // 5. Estructura de Montaje
  items.push({
    id: 'structure',
    category: 'ESTRUCTURA',
    name: 'Sistema de Montaje Aluminio Certificado',
    description: `Rieles Anodizados, Clamps, L-Feet y tornillería inox para ${result.numberOfPanels} módulos`,
    quantity: 1,
    unitPrice: result.numberOfPanels * 120000,
    imageUrl: IMAGES.STRUCTURE
  });

  // 6. Protecciones (Tablero DC/AC)
  items.push({
    id: 'dps-dc',
    category: 'PROTECCIONES',
    name: 'DPS DC 600V - Protección Sobretensiones',
    description: 'Dispositivo de Protección contra Rayos (Clase II)',
    quantity: 1,
    unitPrice: 150000,
    imageUrl: IMAGES.PROTECTION
  });
  
  items.push({
    id: 'breaker-dc',
    category: 'PROTECCIONES',
    name: `Breaker DC ${result.inverter.suggestedBreakerAmps}A 2P (Curva C)`,
    description: 'Interruptor Termomagnético Especial Corriente Directa',
    quantity: 1,
    unitPrice: 85000,
    imageUrl: IMAGES.PROTECTION_1
  });

  items.push({
    id: 'box-combiner',
    category: 'PROTECCIONES',
    name: 'Caja Combinadora IP65',
    description: 'Tablero de distribución para intemperie con riel DIN',
    quantity: 1,
    unitPrice: 120000,
    imageUrl: IMAGES.BOX
  });

  // 7. Cableado Solar
  items.push({
    id: 'cable-pv-kit',
    category: 'CABLEADO',
    name: 'Kit Cableado Solar PV 10 AWG (Rojo/Negro)',
    description: 'Cable Fotovoltaico XLPE 90°C UV 1.5kV - 40 Metros Totales',
    quantity: 1,
    unitPrice: 150000,
    imageUrl: IMAGES.CABLE
  });

  if (input.inverterType !== 'ON_GRID' || input.autonomyDays > 0) {
    const batteryCurrent = result.inverter.suggestedSizeW / input.batteryVoltage;
    let batteryAwg = "4 AWG";
    if (batteryCurrent > 100) batteryAwg = "2 AWG";
    if (batteryCurrent > 150) batteryAwg = "1/0 AWG";

    items.push({
      id: 'cable-batt',
      category: 'CABLEADO',
      name: `Cable Potencia Batería ${batteryAwg}`,
      description: 'Cable flexible extra resistente para conexiones de potencia',
      quantity: 6,
      unitPrice: 35000,
      imageUrl: IMAGES.CABLE_1
    });
  }

  // 8. Puesta a Tierra
  items.push({
    id: 'grounding',
    category: 'INSTALACION',
    name: 'Sistema de Puesta a Tierra',
    description: 'Electrodo Cooperweld 2.4m + Conectores + Cable Desnudo',
    quantity: 1,
    unitPrice: 180000,
    imageUrl: IMAGES.GROUNDING
  });

  // 9. Accesorios Varios
  items.push({
    id: 'conduits',
    category: 'INSTALACION',
    name: 'Canalización y Accesorios',
    description: 'Tubería EMT/PVC, curvas, conduletas y terminales',
    quantity: 1,
    unitPrice: 250000,
    imageUrl: IMAGES.STRUCTURE
  });

  // 10. Mano de Obra
  items.push({
    id: 'labor',
    category: 'INSTALACION',
    name: 'Ingeniería y Montaje Certificado',
    description: 'Diseño, Instalación y Puesta en marcha (Personal TE-1)',
    quantity: 1,
    unitPrice: 800000 + (result.numberOfPanels * 50000),
    imageUrl: IMAGES.LABOR
  });

  return items;
};