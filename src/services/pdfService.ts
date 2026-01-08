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

    console.log("--- TEXTO EXTRAÍDO DO PDF ---");
    console.log(fullText);
    console.log("----------------------------");

    return fullText;
};

export const parseBankStatementRules = (text: string): any[] => {
    const lines = text.split('\n');
    const transactions: any[] = [];

    // Regex patterns for common Brazilian bank formats and general formats
    // Date: DD/MM/YYYY or DD/MM or YYYY-MM-DD
    const dateRegex = /(\d{2}\/\d{2}(\/\d{4})?|\d{4}-\d{2}-\d{2})/g;

    // Improved Value Regex: 
    // Matches 1.234,56 or 1,234.56 or 1234,56 or 1234.56
    // Handles optional negative sign
    const valueRegex = /(-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d{1,3}(?:,\d{3})*\.\d{2}|-?\d+[\.,]\d{2})/g;

    lines.forEach((line, index) => {
        if (!line.trim()) return;

        const dateMatches = [...line.matchAll(dateRegex)];
        const valueMatches = [...line.matchAll(valueRegex)];

        if (dateMatches.length > 0 && valueMatches.length > 0) {
            const dateStr = dateMatches[0][0];

            // Take the last value found on the line (often the transaction value)
            const lastValueMatch = valueMatches[valueMatches.length - 1][0];

            // Normalize value: remove thousand separators and use dot as decimal
            let cleanValueStr = lastValueMatch;
            if (cleanValueStr.includes(',') && cleanValueStr.includes('.')) {
                // Determine format based on last occurrence
                if (cleanValueStr.lastIndexOf(',') > cleanValueStr.lastIndexOf('.')) {
                    // 1.234,56 format
                    cleanValueStr = cleanValueStr.replace(/\./g, '').replace(',', '.');
                } else {
                    // 1,234.56 format
                    cleanValueStr = cleanValueStr.replace(/,/g, '');
                }
            } else {
                // Single separator case, assume it's decimal if it's near the end
                cleanValueStr = cleanValueStr.replace(',', '.');
            }

            const value = parseFloat(cleanValueStr);

            let description = line
                .replace(dateStr, '')
                .replace(lastValueMatch, '')
                .replace(/R\$/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (description && !isNaN(value)) {
                transactions.push({
                    date: dateStr.includes('/') && dateStr.split('/').length === 2
                        ? `${new Date().getFullYear()}-${dateStr.split('/')[1]}-${dateStr.split('/')[0]}`
                        : dateStr.includes('/') ? dateStr.split('/').reverse().join('-') : dateStr,
                    description: description.substring(0, 50),
                    value: value,
                    type: value < 0 ? 'EXPENSE' : 'INCOME',
                    categoryId: 'uncategorized'
                });
            }
        }
    });

    console.log(`Regras (Offline): Encontradas ${transactions.length} transações.`);
    return transactions;
};

export const parsePDF = async (file: File, geminiToken?: string): Promise<any[]> => {
    try {
        const text = await extractTextFromPDF(file);

        if (!text.trim()) {
            throw new Error("Arquivo PDF parece estar vazio ou é uma imagem (OCR necessário).");
        }

        if (geminiToken) {
            try {
                console.log("Tentando processamento com IA Gemini...");
                return await parseBankStatementWithAI(text, geminiToken);
            } catch (err) {
                console.warn("IA falhou, tentando via regras:", err);
            }
        }

        console.log("Usando processamento via regras locais...");
        return parseBankStatementRules(text);
    } catch (err: any) {
        console.error("Erro no processamento do PDF:", err);
        throw err;
    }
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
