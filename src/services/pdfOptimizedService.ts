import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Category } from '../types';
import { formatCurrency, formatDate } from '../utils';

// Type for jsPDF internal API
interface JsPDFInternal {
  getNumberOfPages(): number;
  pageSize: {
    getWidth(): number;
    getHeight(): number;
  };
  [key: string]: unknown;
}

/**
 * Callback function for progress tracking during PDF generation
 * @param progress - Number between 0-100 representing completion percentage
 * @param status - Human-readable status message
 */
export type PDFProgressCallback = (progress: number, status: string) => void;

/**
 * Configuration for optimized PDF generation
 */
interface PDFOptimizationConfig {
  chunkSize?: number; // Number of transactions to process at once (default: 100)
  maxMemoryMB?: number; // Target memory usage in MB (default: 50)
  progressCallback?: PDFProgressCallback;
}

/**
 * Generates PDF report with optimized memory usage for large transaction sets.
 * Uses chunking and progressive processing for 500+ item exports.
 *
 * @param transactions - Array of transactions to export
 * @param categories - Array of categories for categorization
 * @param period - Period string for the report
 * @param summary - Financial summary data
 * @param config - Optimization configuration
 */
export const generatePDFReportOptimized = async (
  transactions: Transaction[],
  categories: Category[],
  period: string,
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
    categoryData: any[];
    goals: any[];
    budgets: any[];
  },
  config: PDFOptimizationConfig = {}
): Promise<void> => {
  const {
    chunkSize = 100,
    progressCallback,
  } = config;

  try {
    // Initialize PDF document
    progressCallback?.(0, 'Inicializando documento PDF...');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Generate header (5% progress)
    progressCallback?.(5, 'Gerando cabeçalho...');
    generatePDFHeader(doc, pageWidth, period);

    // Generate summary (10% progress)
    progressCallback?.(10, 'Adicionando resumo executivo...');
    generatePDFSummary(doc, pageWidth, summary);

    // Generate goals section (15% progress)
    progressCallback?.(15, 'Adicionando objetivos...');
    let currentY = generatePDFGoals(doc, pageWidth, summary.goals);

    // Process transactions in chunks
    const totalTransactions = transactions.length;
    const chunkCount = Math.ceil(totalTransactions / chunkSize);

    progressCallback?.(20, `Processando ${totalTransactions} transações em ${chunkCount} lotes...`);

    for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
      const startIdx = chunkIndex * chunkSize;
      const endIdx = Math.min(startIdx + chunkSize, totalTransactions);
      const chunk = transactions.slice(startIdx, endIdx);

      // Process chunk and add to PDF
      currentY = generatePDFTransactionChunk(
        doc,
        pageWidth,
        currentY,
        chunk,
        categories,
        chunkIndex === 0 // addHeader for first chunk
      );

      // Update progress (20% to 80%)
      const progress = 20 + ((chunkIndex + 1) / chunkCount) * 60;
      progressCallback?.(
        Math.round(progress),
        `Processadas ${endIdx}/${totalTransactions} transações...`
      );

      // Force garbage collection hint after each chunk
      if (typeof gc !== 'undefined') {
        gc();
      }
    }

    // Generate footer (90% progress)
    progressCallback?.(90, 'Finalizando documento...');
    generatePDFFooter(doc, pageWidth);

    // Save document (95% progress)
    progressCallback?.(95, 'Salvando arquivo...');
    doc.save(`SPFP_Relatorio_${period.replace(' ', '_')}.pdf`);

    // Complete (100% progress)
    progressCallback?.(100, 'PDF gerado com sucesso!');
  } catch (error) {
    progressCallback?.(0, `Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    throw error;
  }
};

/**
 * Generate PDF header section
 */
function generatePDFHeader(doc: jsPDF, pageWidth: number, period: string): void {
  // Background Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Logo Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('playfair', 'bold');
  doc.setFontSize(24);
  doc.text('SPFP', 14, 20);

  doc.setFont('inter', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Planejador Financeiro Pessoal', 14, 28);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`RELATÓRIO MENSAL - ${period.toUpperCase()}`, pageWidth - 14, 25, { align: 'right' });
}

/**
 * Generate Executive Summary section
 */
function generatePDFSummary(
  doc: jsPDF,
  pageWidth: number,
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
    categoryData: any[];
    goals: any[];
    budgets: any[];
  }
): void {
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(16);
  doc.setFont('inter', 'bold');
  doc.text('Resumo Executivo', 14, 55);

  // Summary Cards
  const cardWidth = (pageWidth - 40) / 3;

  // Income Card
  doc.setFillColor(240, 253, 244); // bg-emerald-50
  doc.roundedRect(14, 65, cardWidth, 25, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('TOTAL RECEITAS', 19, 72);
  doc.setFontSize(12);
  doc.text(formatCurrency(summary.totalIncome), 19, 82);

  // Expense Card
  doc.setFillColor(254, 242, 242); // bg-rose-50
  doc.roundedRect(14 + cardWidth + 6, 65, cardWidth, 25, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text('TOTAL DESPESAS', 19 + cardWidth + 6, 72);
  doc.setFontSize(12);
  doc.text(formatCurrency(summary.totalExpense), 19 + cardWidth + 6, 82);

  // Balance Card
  doc.setFillColor(239, 246, 255); // bg-blue-50
  doc.roundedRect(14 + (cardWidth + 6) * 2, 65, cardWidth, 25, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('BALANÇO LÍQUIDO', 19 + (cardWidth + 6) * 2, 72);
  doc.setFontSize(12);
  doc.text(formatCurrency(summary.balance), 19 + (cardWidth + 6) * 2, 82);

  // Savings Rate
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Taxa de Poupança: ${summary.savingsRate.toFixed(1)}%`, 14, 105);
}

/**
 * Generate Goals section and return current Y position
 */
function generatePDFGoals(
  doc: jsPDF,
  pageWidth: number,
  goals: any[]
): number {
  let currentY = 120;

  if (goals.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Objetivos Patrimoniais', 14, currentY);
    currentY += 10;

    goals.forEach(goal => {
      const percent = Math.round((goal.currentValue / goal.targetValue) * 100);
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `${goal.name}: ${formatCurrency(goal.currentValue)} de ${formatCurrency(goal.targetValue)} (${percent}%)`,
        14,
        currentY
      );

      // Progress Bar
      doc.setFillColor(226, 232, 240); // slate-200
      doc.rect(14, currentY + 2, 100, 2, 'F');
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(14, currentY + 2, Math.min(percent, 100), 2, 'F');

      currentY += 15;
    });
  }

  return currentY;
}

/**
 * Generate a chunk of transactions with automatic page breaks
 * Returns the new current Y position
 */
function generatePDFTransactionChunk(
  doc: jsPDF,
  pageWidth: number,
  startY: number,
  transactions: Transaction[],
  categories: Category[],
  addHeader: boolean
): number {
  if (transactions.length === 0) {
    return startY;
  }

  const pageHeight = doc.internal.pageSize.getHeight();

  // Add table header if this is the first chunk
  if (addHeader) {
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Detalhamento de Movimentações', 14, startY + 10);
    startY += 15;
  }

  // Prepare table data
  const tableData = transactions.map(t => [
    formatDate(t.date),
    t.description.substring(0, 40), // Truncate for memory efficiency
    categories.find(c => c.id === t.categoryId)?.name || 'Outros',
    formatCurrency(t.value)
  ]);

  // Generate table for this chunk
  autoTable(doc, {
    head: addHeader ? [['Data', 'Descrição', 'Categoria', 'Valor']] : [],
    body: tableData,
    startY: startY,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const tx = transactions[data.row.index];
        if (tx.type === 'INCOME') {
          data.cell.styles.textColor = [5, 150, 105];
        } else {
          data.cell.styles.textColor = [225, 29, 72];
        }
        data.cell.styles.fontStyle = 'bold' as 'bold';
      }
    },
    margin: { top: 10 },
    didDrawPage: (data) => {
      // Prevent overlap with footer
      if (data.pageNumber > 1) {
        // Add page break if needed
      }
    }
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || startY + tableData.length * 10;

  return Math.min(finalY + 10, pageHeight - 20);
}

/**
 * Generate PDF footer with page numbers
 */
function generatePDFFooter(doc: jsPDF, pageWidth: number): void {
  const pageCount = (doc as unknown as { internal: JsPDFInternal }).internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')} | Página ${i} de ${pageCount} | SPFP Intelligence`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
}

/**
 * Calculate estimated memory usage for PDF generation
 * @param transactionCount - Number of transactions to generate
 * @returns Estimated memory in MB
 */
export const estimatePDFMemoryUsage = (transactionCount: number): number => {
  // Rough estimate: ~1KB per transaction
  const transactionMemory = (transactionCount * 1024) / (1024 * 1024); // Convert to MB
  const baseMemory = 5; // Base PDF structure
  return transactionMemory + baseMemory;
};
