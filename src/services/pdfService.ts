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
                const baseTransaction = {
                    date: currentDate,
                    description: description.substring(0, 50) || 'Transação Importada',
                    value: value,
                    type: value < 0 ? 'EXPENSE' : 'INCOME',
                    categoryId: 'uncategorized'
                };

                transactions.push(baseTransaction);

                // DETECÇÃO AUTOMÁTICA DE PARCELAS (Ex: "02/06" ou "1/10")
                const installmentRegex = /\b(\d{1,2})\s*[\/]\s*(\d{1,2})\b/;
                const match = description.match(installmentRegex);

                if (match && currentDate) {
                    const currentInstallment = parseInt(match[1]);
                    const totalInstallments = parseInt(match[2]);

                    if (totalInstallments > currentInstallment && totalInstallments <= 72) { // Limite de 6 anos por segurança
                        const [year, month, day] = currentDate.split('-').map(Number);
                        const remaining = totalInstallments - currentInstallment;

                        for (let i = 1; i <= remaining; i++) {
                            const nextDate = new Date(year, month - 1 + i, day, 12, 0, 0);
                            const nextInstallmentNum = currentInstallment + i;

                            // Formata a nova descrição substituindo a parcela (ex: de 02/06 para 03/06)
                            const nextDescription = description.replace(
                                installmentRegex,
                                `${String(nextInstallmentNum).padStart(match[1].length, '0')}/${match[2]}`
                            );

                            transactions.push({
                                ...baseTransaction,
                                date: nextDate.toISOString().split('T')[0],
                                description: nextDescription.substring(0, 50)
                            });
                        }
                    }
                }
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

export const generatePDFReport = async (
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
    }
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header & Branding ---
    // Background Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo Text (Simulating Logo with text since we don't have base64 image easily here)
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

    // --- Executive Summary Section ---
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(16);
    doc.setFont('inter', 'bold');
    doc.text('Resumo Executivo', 14, 55);

    // Summary Cards (manual drawing)
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

    // Savings Rate Info
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Taxa de Poupança: ${summary.savingsRate.toFixed(1)}%`, 14, 105);

    // --- Goals Section (if any) ---
    let currentY = 120;
    if (summary.goals.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('Objetivos Patrimoniais', 14, currentY);
        currentY += 10;

        summary.goals.forEach(goal => {
            const percent = Math.round((goal.currentValue / goal.targetValue) * 100);
            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105);
            doc.text(`${goal.name}: ${formatCurrency(goal.currentValue)} de ${formatCurrency(goal.targetValue)} (${percent}%)`, 14, currentY);

            // Progress Bar
            doc.setFillColor(226, 232, 240); // slate-200
            doc.rect(14, currentY + 2, 100, 2, 'F');
            doc.setFillColor(16, 185, 129); // emerald-500
            doc.rect(14, currentY + 2, Math.min(percent, 100), 2, 'F');

            currentY += 15;
        });
    }

    // --- Detailed Transactions Table ---
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Detalhamento de Movimentações', 14, currentY + 10);

    const tableData = transactions.map(t => [
        formatDate(t.date),
        t.description,
        categories.find(c => c.id === t.categoryId)?.name || 'Outros',
        formatCurrency(t.value)
    ]);

    autoTable(doc, {
        head: [['Data', 'Descrição', 'Categoria', 'Valor']],
        body: tableData,
        startY: currentY + 15,
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
        margin: { top: 40 }
    });

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Gerado em ${new Date().toLocaleDateString('pt-BR')} | Página ${i} de ${pageCount} | SPFP Intelligence`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`SPFP_Relatorio_${period.replace(' ', '_')}.pdf`);
};
