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
        const items = textContent.items as any[];

        // Group items by their vertical position (Y coordinate) with some tolerance
        const rows: { y: number, items: any[] }[] = [];

        items.forEach(item => {
            const y = item.transform[5];
            let row = rows.find(r => Math.abs(r.y - y) < 3); // 3 units tolerance for Y-alignment
            if (!row) {
                row = { y, items: [] };
                rows.push(row);
            }
            row.items.push(item);
        });

        // Sort rows from top to bottom (Y descending)
        rows.sort((a, b) => b.y - a.y);

        const pageText = rows.map(row => {
            // Sort items within each row from left to right (X ascending)
            return row.items
                .sort((a, b) => a.transform[4] - b.transform[4])
                .map(item => item.str)
                .join(' ');
        }).join('\n');

        fullText += pageText + '\n';
    }

    return fullText;
};

export const parseBankStatementRules = (text: string): any[] => {
    const lines = text.split('\n');
    const transactions: any[] = [];

    // Regex patterns for common Brazilian bank formats
    // Date: DD/MM/YYYY or DD/MM
    const dateRegex = /(\d{2}\/\d{2}(\/\d{4})?)/g;
    // Value: 1.234,56 or -1.234,56 or 1234.56
    const valueRegex = /(-?\d{1,3}(\.\d{3})*,\d{2}|-?\d+[\.,]\d{2})/g;

    lines.forEach(line => {
        if (!line.trim()) return;

        // Re-run regex for each line using matchAll to handle multiple potential matches
        // though usually we want one transaction per line.
        const dateMatches = [...line.matchAll(dateRegex)];
        const valueMatches = [...line.matchAll(valueRegex)];

        if (dateMatches.length > 0 && valueMatches.length > 0) {
            // Take the first date found on the line
            const dateStr = dateMatches[0][0];

            // Take the last value found on the line (often the transaction value, 
            // after headers or balance columns if they exist on same line)
            const lastValueMatch = valueMatches[valueMatches.length - 1][0];
            const valueStr = lastValueMatch.replace(/\./g, '').replace(',', '.');
            const value = parseFloat(valueStr);

            // Description is usually what's left after removing date and value
            // We use the specific matches found to avoid over-replacing
            let description = line
                .replace(dateStr, '')
                .replace(lastValueMatch, '')
                .replace(/R\$/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (description && !isNaN(value)) {
                // If the description is just another date or value, skip it
                if (description.match(dateRegex) || description.match(valueRegex)) {
                    // Possible balance line or multi-column line, skip for safety unless specific
                }

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
