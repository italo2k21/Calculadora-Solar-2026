import { jsPDF } from "jspdf";
import { SolarInputData, CalculationResult, QuoteItem } from "../types";

export const generatePDFReport = (
  input: SolarInputData,
  result: CalculationResult,
  aiReportText: string | null,
  quoteItems: QuoteItem[] = []
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Helper for checking page overflow
  const checkPage = (heightNeeded: number) => {
    if (yPos + heightNeeded > 280) {
      doc.addPage();
      yPos = 20;
    }
  };

  // --- Header ---
  doc.setFillColor(245, 158, 11); // Solar Orange
  doc.rect(0, 0, pageWidth, 4, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text("SolarCalc AI", 20, yPos);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Propuesta Técnica y Económica", 20, yPos + 6);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 20, yPos, { align: 'right' });

  yPos += 20;

  // --- Sección: Información del Cliente ---
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos, pageWidth - 30, 25, 'F'); // Taller box
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Información del Cliente", 20, yPos + 7);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  // Column 1
  doc.text(`Nombre: ${input.customerName || 'N/A'}`, 20, yPos + 15);
  doc.text(`Teléfono: ${input.customerPhone || 'N/A'}`, 20, yPos + 21);
  
  // Column 2
  doc.text(`Email: ${input.customerEmail || 'N/A'}`, 110, yPos + 15);
  doc.text(`Dirección: ${input.customerAddress || 'N/A'}`, 110, yPos + 21);

  yPos += 35;


  // --- Sección 1: Ubicación y Parámetros ---
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("1. Ubicación y Datos Financieros", 20, yPos + 6);
  yPos += 15;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Grid layout simulation
  const col1 = 20;
  const col2 = 100;
  
  doc.text(`Ciudad: ${input.cityName}`, col1, yPos);
  doc.text(`Recurso Solar (HSP): ${input.peakSunHours} h`, col2, yPos);
  yPos += 7;
  
  if (input.calculationMode === 'BILL') {
     const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });
     doc.text(`Factura Actual Promedio: ${formatter.format(input.monthlyBillAmount)}`, col1, yPos);
     doc.text(`Costo Unitario kWh: ${formatter.format(input.electricityRate)}`, col2, yPos);
     yPos += 7;
  }

  doc.text(`Voltaje del Sistema: ${input.batteryVoltage} VDC`, col1, yPos);
  doc.text(`Autonomía: ${input.autonomyDays} día(s)`, col2, yPos);
  yPos += 7;
  
  const consumptionLabel = input.calculationMode === 'BILL' ? 'Consumo Calculado' : 'Carga Diaria Calculada';
  const consumptionValue = input.calculationMode === 'BILL' 
    ? `${input.monthlyConsumption} kWh/mes` 
    : `${(result.dailyConsumptionWh / 1000).toFixed(2)} kWh/día`;
    
  doc.text(`${consumptionLabel}: ${consumptionValue}`, col1, yPos);
  yPos += 15;

  // --- Sección 2: Equipo de Generación ---
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. Equipo de Generación (Paneles)", 20, yPos + 6);
  yPos += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Marca: ${input.selectedPanel.brand}`, col1, yPos);
  doc.text(`Modelo: ${input.selectedPanel.model}`, col2, yPos);
  yPos += 7;
  doc.text(`Potencia Unitaria: ${input.selectedPanel.power} W`, col1, yPos);
  doc.text(`Tecnología: ${input.selectedPanel.type}`, col2, yPos);
  yPos += 15;

  // --- Sección 3: Resultados de Ingeniería ---
  doc.setFillColor(236, 253, 245); // Light green hint
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. Resumen del Sistema (Resultados)", 20, yPos + 6);
  yPos += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  // Panels Result
  doc.text(`• Cantidad de Paneles: ${result.numberOfPanels} unidades`, col1, yPos);
  yPos += 7;
  doc.text(`• Potencia Total Instalada (Array): ${(result.numberOfPanels * input.selectedPanel.power / 1000).toFixed(2)} kWp`, col1, yPos);
  yPos += 7;
  doc.text(`• Generación Diaria Estimada: ${(result.estimatedGenerationDailyWh / 1000).toFixed(2)} kWh/día`, col1, yPos);
  yPos += 10;

  // Battery Result
  doc.text(`• Banco de Baterías: ${Math.round(result.batteryCapacityAh)} Ah (@ ${input.batteryVoltage}V)`, col1, yPos);
  yPos += 7;
  doc.text(`• Capacidad de Almacenamiento: ${((result.batteryCapacityAh * input.batteryVoltage) / 1000).toFixed(2)} kWh`, col1, yPos);
  yPos += 10;

  // Inverter Result
  doc.text(`• Inversor Sugerido: ${result.inverter.suggestedSizeW} W`, col1, yPos);
  yPos += 7;
  doc.text(`• Tipo: ${result.inverter.type}`, col1, yPos);
  yPos += 7;
  doc.text(`• Protecciones DC Sugeridas: Breaker de ${result.inverter.suggestedBreakerAmps} A`, col1, yPos);
  
  yPos += 20;

  // --- Sección 4: Propuesta Económica (NEW) ---
  if (quoteItems.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFillColor(254, 243, 199); // Light yellow
    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("4. Oferta Económica (Lista de Materiales)", 20, yPos + 6);
    yPos += 15;

    // Table Header
    doc.setFillColor(50, 50, 50);
    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Item / Descripción", 20, yPos + 5);
    doc.text("Cant.", 120, yPos + 5);
    doc.text("Vr. Unitario", 140, yPos + 5);
    doc.text("Total", 170, yPos + 5);
    yPos += 10;

    // Table Body
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    let grandTotal = 0;

    quoteItems.forEach((item, index) => {
        checkPage(15);
        
        // Strip emoji/icon from name if basic logic used before (clean string)
        const name = item.name.substring(0, 45);
        const subtotal = item.quantity * item.unitPrice;
        grandTotal += subtotal;

        // Background alternate
        if (index % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, yPos - 3, pageWidth - 30, 10, 'F');
        }

        doc.setFont("helvetica", "bold");
        doc.text(name, 20, yPos);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(item.description.substring(0, 60), 20, yPos + 4);
        doc.setFontSize(9);

        doc.text(item.quantity.toString(), 122, yPos);
        doc.text(formatter.format(item.unitPrice).replace('COP', '').trim(), 140, yPos);
        doc.text(formatter.format(subtotal).replace('COP', '').trim(), 170, yPos);

        yPos += 10;
    });

    // Grand Total
    yPos += 5;
    doc.setFillColor(245, 158, 11); // Solar Orange
    
    // Configuración de la caja de Total: Muy ancha y alineada
    const totalBoxStartX = 50; // Empezamos mucho más a la izquierda (era 80/130)
    const totalBoxWidth = (pageWidth - 20) - totalBoxStartX; // Hasta el margen derecho
    
    doc.rect(totalBoxStartX, yPos, totalBoxWidth, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    
    // Etiqueta del Total
    doc.setFontSize(12);
    doc.text("TOTAL PROYECTO:", totalBoxStartX + 5, yPos + 8);
    
    // Valor (Alineado a la Derecha para evitar desbordes)
    doc.setFontSize(14); 
    const totalString = formatter.format(grandTotal).replace('COP', '').trim();
    // La coordenada X es el límite derecho de la caja menos un pequeño margen (pageWidth - 25)
    doc.text(totalString, pageWidth - 25, yPos + 8, { align: 'right' });
    
    yPos += 20;
    doc.setTextColor(0,0,0);
  }

  // --- Sección 5: Análisis IA ---
  if (aiReportText) {
    checkPage(30);
    
    doc.setFillColor(230, 240, 255); // Light blue
    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("5. Análisis Técnico Detallado (IA)", 20, yPos + 6);
    yPos += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    // Clean Markdown basics for PDF text
    const cleanText = aiReportText
        .replace(/\*\*/g, "") // Remove bold markers
        .replace(/##/g, "") // Remove header markers
        .replace(/\*/g, "•"); // Replace bullets

    const splitText = doc.splitTextToSize(cleanText, pageWidth - 40);
    
    if (yPos + splitText.length * 5 > 280) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.text(splitText, 20, yPos);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`SolarCalc AI - Propuesta para ${input.customerName || 'Cliente'} - ${new Date().toLocaleDateString()} - Pág ${i}/${pageCount}`, pageWidth / 2, 290, { align: "center" });
  }

  const fileName = input.customerName 
    ? `Oferta_Solar_${input.customerName.replace(/\s/g, '_')}.pdf` 
    : `Reporte_Solar_${input.cityName.replace(/\s/g, '_')}_${new Date().getTime()}.pdf`;

  doc.save(fileName);
};