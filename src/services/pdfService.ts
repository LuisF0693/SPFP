import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Category } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';
import { parseBankStatementWithAI } from './geminiService';

// Initialize PDF.js worker
// Using local bundled worker via Vite to avoid external CDN issues
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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

export const parseBankStatementRules = (text: string): any[] => {
    const lines = text.split('\n');
    const transactions: any[] = [];

    // Regex patterns for common Brazilian bank formats
    // Date: DD/MM/YYYY or DD/MM
    const dateRegex = /(\d{2}\/\d{2}(\/\d{4})?)/;
    // Value: 1.234,56 or -1.234,56 or 1234.56
    const valueRegex = /(-?\d{1,3}(\.\d{3})*,\d{2}|-?\d+[\.,]\d{2})/;

    lines.forEach(line => {
        if (!line.trim()) return;

        const dateMatch = line.match(dateRegex);
        const valueMatch = line.match(valueRegex);

        if (dateMatch && valueMatch) {
            const dateStr = dateMatch[0];
            const valueStr = valueMatch[0].replace(/\./g, '').replace(',', '.');
            const value = parseFloat(valueStr);

            // Description is usually what's left after removing date and value
            let description = line
                .replace(dateRegex, '')
                .replace(valueRegex, '')
                .replace(/R\$/g, '')
                .trim();

            if (description && !isNaN(value)) {
                transactions.push({
                    date: dateStr.includes('/') && dateStr.split('/').length === 2
                        ? `${new Date().getFullYear()}-${dateStr.split('/')[1]}-${dateStr.split('/')[0]}` // DD/MM to YYYY-MM-DD
                        : dateStr.split('/').reverse().join('-'), // DD/MM/YYYY to YYYY-MM-DD
                    description: description.substring(0, 50),
                    value: value,
                    type: value < 0 ? 'EXPENSE' : 'INCOME',
                    categoryId: 'uncategorized'
                });
            }
        }
    });

    return transactions;
};

export const parsePDF = async (file: File, geminiToken?: string): Promise<any[]> => {
    const text = await extractTextFromPDF(file);

    if (geminiToken) {
        try {
            console.log("Attempting AI parsing...");
            return await parseBankStatementWithAI(text, geminiToken);
        } catch (err) {
            console.error("AI Parsing failed, falling back to rules:", err);
        }
    }

    console.log("Using rule-based parsing...");
    return parseBankStatementRules(text);
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
