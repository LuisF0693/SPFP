import { Transaction, TransactionType } from '../types';
import { generateId } from '../utils';
import { parseBankStatementWithAI } from './geminiService';

export const exportTransactionsToCSV = (transactions: Transaction[]): void => {
  const headers = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria ID', 'Conta ID'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t =>
      `${t.date},"${t.description.replace(/"/g, '""')}",${t.value},${t.type},${t.categoryId},${t.accountId}`
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (csvText: string): Partial<Transaction>[] => {
  const lines = csvText.split('\n');
  const transactions: Partial<Transaction>[] = [];

  // Determine delimiter (, or ;)
  const firstLine = lines[0] || '';
  const delimiter = firstLine.includes(';') ? ';' : ',';

  // Find header index
  let headerIndex = -1;
  const headers = ['data', 'descrição', 'valor', 'tipo', 'date', 'description', 'value', 'amount'];

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const cols = lines[i].toLowerCase().split(delimiter);
    if (headers.some(h => cols.includes(h))) {
      headerIndex = i;
      break;
    }
  }

  const dataLines = headerIndex === -1 ? lines : lines.slice(headerIndex + 1);
  const headerCols = headerIndex === -1 ? [] : lines[headerIndex].toLowerCase().split(delimiter).map(h => h.trim());

  // Mapeamento de colunas para campos
  const getIdx = (variants: string[]) => headerCols.findIndex(h => variants.some(v => h.includes(v)));

  const dateIdx = getIdx(['data', 'date']);
  const descIdx = getIdx(['descrição', 'desc', 'description', 'histórico', 'lançamento', 'estabelecimento', 'favorecido', 'detalhe', 'memo']);
  const valueIdx = getIdx(['valor', 'value', 'amount', 'pago', 'recebido', 'quantia', 'total']);

  console.log("--- DIAGNÓSTICO DE COLUNAS CSV ---");
  console.log("Cabeçalhos detectados:", headerCols);
  console.log(`Mapeamento: Data(idx:${dateIdx}), Descrição(idx:${descIdx}), Valor(idx:${valueIdx})`);
  console.log("---------------------------------");

  dataLines.forEach((line, index) => {
    if (!line.trim()) return;

    const columns = line.split(delimiter).map(c => c.trim().replace(/^"(.*)"$/, '$1'));

    let date = '';
    let description = '';
    let value = 0;

    if (headerIndex !== -1) {
      date = columns[dateIdx] || '';
      description = (descIdx !== -1 ? columns[descIdx] : '') || '';

      let valStr = (valueIdx !== -1 ? columns[valueIdx] : '0') || '0';

      // Normalização robusta de números
      if (valStr.includes(',') && valStr.includes('.')) {
        if (valStr.lastIndexOf(',') > valStr.lastIndexOf('.')) {
          valStr = valStr.replace(/\./g, '').replace(',', '.');
        } else {
          valStr = valStr.replace(/,/g, '');
        }
      } else {
        valStr = valStr.replace(',', '.');
      }

      value = parseFloat(valStr);
    } else {
      // Fallback por posição se não houver cabeçalhos claros
      date = columns[0] || '';

      // Tenta adivinhar qual coluna é o valor (aquela que tem números e separadores)
      const isNumeric = (s: string) => !isNaN(parseFloat(s?.replace(',', '.'))) && s?.match(/\d/);

      const col1IsNumeric = isNumeric(columns[1]);
      const col2IsNumeric = isNumeric(columns[2]);

      if (col2IsNumeric && !col1IsNumeric) {
        description = columns[1];
        value = parseFloat(columns[2].replace(',', '.'));
      } else if (col1IsNumeric) {
        description = columns[2] || columns[0];
        value = parseFloat(columns[1].replace(',', '.'));
      } else {
        description = columns[1] || 'Sem descrição';
        value = parseFloat(columns[2]?.replace(',', '.') || '0');
      }
    }

    if (date && !isNaN(value)) {
      transactions.push({
        id: generateId(),
        date: date.includes('/') ? date.split('/').reverse().join('-') : date,
        description: description || 'Sem descrição',
        value: Math.abs(value),
        type: value < 0 ? 'EXPENSE' : 'INCOME',
        categoryId: 'uncategorized',
        accountId: 'default',
      });
    }
  });

  console.log(`CSV: Encontradas ${transactions.length} transações.`);
  return transactions;
};

export const parseCSVWithAI = async (text: string, geminiToken?: string): Promise<any[]> => {
  if (geminiToken) {
    try {
      console.log("Attempting AI parsing for CSV...");
      // We can reuse the same AI logic since the prompt is generic enough
      return await parseBankStatementWithAI(text, geminiToken);
    } catch (err) {
      console.error("AI CSV Parsing failed, falling back to rules:", err);
    }
  }

  return parseCSV(text);
};
