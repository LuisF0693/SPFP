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

    // Mapeamento de meses em português (curto e longo)
    const monthMap: { [key: string]: string } = {
        'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04', 'mai': '05', 'jun': '06',
        'jul': '07', 'ago': '08', 'set': '09', 'out': '10', 'nov': '11', 'dez': '12',
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };

    // Regex para diferentes formatos de data
    const standardDateRegex = /(\d{2}\/\d{2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2})/;
    const extendedDateRegex = /(\d{1,2})\s+de\s+([a-zA-ZçÇ]+)\s+de\s+(\d{4})/i;
    const shortDateRegex = /(\d{1,2})\s+([A-Z]{3})/; // Ex: 13 NOV

    // Regex de Valor melhorado: Suporta -R$ 1.234,56, R$ 1.234,56 ou 1.234,56
    const valueRegex = /(-?\s*R\$\s*[\d\.,]+|-?[\d\.]+,\d{2}|-?[\d,]+\.\d{2})/g;

    // Palavras que indicam que a linha NÃO é uma transação individual
    const blackList = [
        'Limite', 'Saldo', 'Vencimento', 'Pagamento mínimo', 'Total a pagar',
        'Fatura anterior', 'Total de compras', 'Próximas faturas', 'Utilizado',
        'Disponível', 'Valor máximo', 'SAC:', 'Ouvidoria:', 'Nu Pagamentos',
        'CNPJ', 'Rua Capote Valente', 'Juros', 'IOF', 'CET', 'Composição',
        'Você quita', 'Sempre a melhor', 'Pagar o valor', 'Parcele a sua',
        'vencimento da fatura', 'entrada e escolhe', 'Ideal para', 'atraso',
        'negativado', 'Nunca é uma boa', 'encargos', 'resumo da fatura',
        'vincendo', 'vigente', 'extrato', 'período'
    ];

    let currentDate: string | null = null;
    const currentYear = new Date().getFullYear();

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Se a linha contiver alguma palavra da lista negra, ignoramos
        if (blackList.some(word => trimmedLine.toLowerCase().includes(word.toLowerCase()))) {
            return;
        }

        // 1. Tenta encontrar um cabeçalho de data por extenso (ex: "7 de Dezembro de 2025")
        const extendedMatch = trimmedLine.match(extendedDateRegex);
        if (extendedMatch) {
            const day = extendedMatch[1].padStart(2, '0');
            const monthName = extendedMatch[2].toLowerCase();
            const year = extendedMatch[3];
            const month = monthMap[monthName];
            if (month) {
                currentDate = `${year}-${month}-${day}`;
                return; // Pula o processamento desta linha como transação
            }
        }

        // 2. Tenta encontrar data curta (ex: "13 NOV") - Comum no Nubank
        const shortMatch = trimmedLine.match(shortDateRegex);
        if (shortMatch) {
            const day = shortMatch[1].padStart(2, '0');
            const monthShort = shortMatch[2].toLowerCase();
            const month = monthMap[monthShort];
            if (month) {
                // Se não temos ano no texto curto, usamos o ano atual ou o ano detectado no cabeçalho
                const year = currentDate ? currentDate.split('-')[0] : currentYear;
                currentDate = `${year}-${month}-${day}`;
            }
        }

        // 3. Tenta encontrar uma data padrão na linha (ex: "06/01/2026")
        const standardMatch = trimmedLine.match(standardDateRegex);
        if (standardMatch) {
            const dateStr = standardMatch[0];
            currentDate = dateStr.includes('/') && dateStr.split('/').length === 2
                ? `${currentYear}-${dateStr.split('/')[1]}-${dateStr.split('/')[0]}`
                : dateStr.includes('/') ? dateStr.split('/').reverse().join('-') : dateStr;
        }

        // 4. Procura por valores na linha
        const valueMatches = [...trimmedLine.matchAll(valueRegex)];

        // Filtra linhas de saldo ou metadados
        if (trimmedLine.includes('Saldo do dia') || trimmedLine.includes('Saldo total') || trimmedLine.includes('Saldo disponível') || trimmedLine.includes('Saldo por transação')) {
            return;
        }

        if (valueMatches.length > 0 && currentDate) {
            // Em faturas, ignoramos se houver muitos valores (geralmente é tabela de parcelamento)
            if (valueMatches.length > 4) return;

            // Pegamos o primeiro valor (mais provável ser a transação).
            let lastValueMatch = valueMatches[0][0];

            // Limpa a string do valor
            let cleanValueStr = lastValueMatch
                .replace(/R\$/g, '')
                .replace(/\s/g, '');

            // Normalização de decimais
            if (cleanValueStr.includes(',') && cleanValueStr.includes('.')) {
                if (cleanValueStr.lastIndexOf(',') > cleanValueStr.lastIndexOf('.')) {
                    cleanValueStr = cleanValueStr.replace(/\./g, '').replace(',', '.');
                } else {
                    cleanValueStr = cleanValueStr.replace(/,/g, '');
                }
            } else {
                cleanValueStr = cleanValueStr.replace(',', '.');
            }

            const value = parseFloat(cleanValueStr);

            // Descrição é o que vem antes do valor ou o que sobrar
            let description = trimmedLine
                .split(lastValueMatch)[0] // Pega tudo antes do valor
                .replace(currentDate, '')
                .replace(extendedDateRegex, '')
                .replace(standardDateRegex, '')
                .replace(shortDateRegex, '')
                .replace(/Pix enviado:|Pix recebido:|Compra no debito:|Pix enviado devolvido:/g, '')
                .replace(/"/g, '')
                .replace(/\s\w\s[\w\*]+\s[\d\*]+\s*/, ' ') // Remove ícones e IDs de cartão do Nubank
                .replace(/\d{4}$/, '') // Remove final do cartão se houver (ex: .... 5802)
                .replace(/\s+/g, ' ')
                .trim();

            if (!description || description.length < 2) {
                // Se falhar o split, tenta pegar o resto da linha removendo o valor
                description = trimmedLine.replace(lastValueMatch, '').substring(0, 50).trim();
            }

            if (!isNaN(value) && Math.abs(value) > 0) {
                transactions.push({
                    date: currentDate,
                    description: description.substring(0, 50) || 'Transação Importada',
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
