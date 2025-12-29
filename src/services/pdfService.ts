import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Category } from '../types';
import { formatCurrency, formatDate } from '../utils';

// Initialize PDF.js worker
// Using CDN for simplicity in this environment to avoid complex Vite build config issues with workers
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
};

export const generatePDFReport = (transactions: Transaction[], categories: Category[], period: string) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Relatório Financeiro - ${period}`, 14, 22);

    const tableData = transactions.map(t => {
        const categoryName = categories.find(c => c.id === t.categoryId)?.name || 'Sem Categoria';
        return [
            formatDate(t.date),
            t.description,
            t.type === 'INCOME' ? 'Receita' : 'Despesa',
            categoryName,
            formatCurrency(t.value)
        ];
    });

    // @ts-ignore - jspdf-autotable types might be tricky
    autoTable(doc, {
        head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']],
        body: tableData,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 163, 74] }, // Green-600
    });

    doc.save(`relatorio_${period}.pdf`);
};
