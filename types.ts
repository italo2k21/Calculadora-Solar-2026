export interface Appliance {
  id: string;
  name: string;
  power: number; // Watts per unit
  quantity: number;
  hours: number; // Hours per day
}

export interface SolarPanel {
  id: string;
  brand: string;
  model: string;
  power: number;
  type: string; // Monocrystalline, etc.
  priceEstimate?: number; // Optional COP estimate
}

export type CalculationMode = 'BILL' | 'LOAD_ANALYSIS';
export type InverterType = 'OFF_GRID' | 'ON_GRID' | 'HYBRID';

export interface SolarInputData {
  calculationMode: CalculationMode;
  cityName: string; // Location
  // Customer Data
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  // Financial Data (New)
  monthlyBillAmount: number; // COP
  electricityRate: number; // COP per kWh
  // Technical Data
  monthlyConsumption: number; // kWh (Used in BILL mode)
  peakSunHours: number; // h (HSP)
  selectedPanel: SolarPanel; // Updated from simple number to Object
  batteryVoltage: number; // V (12, 24, 48)
  autonomyDays: number; // Days
  systemEfficiency: number; // 0-1 (usually 0.7 - 0.85)
  inverterType: InverterType; // New field
  appliances: Appliance[]; // Used in LOAD_ANALYSIS mode
}

export interface InverterDetails {
  suggestedSizeW: number;
  type: string;
  inputVoltage: number;
  suggestedBreakerAmps: number;
  efficiency: number;
}

export interface CalculationResult {
  dailyConsumptionWh: number;
  maxPowerDemandW: number; // Peak load based on active appliances
  numberOfPanels: number;
  inverter: InverterDetails;
  batteryCapacityAh: number;
  estimatedGenerationDailyWh: number;
}

export interface ChartDataPoint {
  hour: string;
  production: number;
  consumption: number;
}

export enum CalculationStatus {
  IDLE = 'IDLE',
  CALCULATED = 'CALCULATED'
}

// New Quote Types
export type QuoteCategory = 'GENERACION' | 'ALMACENAMIENTO' | 'ELECTRONICA' | 'ESTRUCTURA' | 'PROTECCIONES' | 'CABLEADO' | 'INSTALACION';

export interface QuoteItem {
  id: string;
  category: QuoteCategory;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}