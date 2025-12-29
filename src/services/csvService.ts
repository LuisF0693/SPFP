import { Transaction, TransactionType } from '../types';
import { generateId } from '../utils';

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

  // Remove header
  const dataLines = lines.slice(1);

  dataLines.forEach(line => {
    if (!line.trim()) return;
    
    // Simple CSV parser that handles quotes
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Fallback for simple split if regex fails or complicates
    const columns = line.split(','); 

    // Expecting: Date, Description, Value, Type, CategoryID, AccountID
    if (columns.length >= 3) {
      const date = columns[0].trim();
      let description = columns[1].trim();
      if (description.startsWith('"') && description.endsWith('"')) {
        description = description.slice(1, -1).replace(/""/g, '"');
      }
      const value = parseFloat(columns[2]);
      const type = (columns[3]?.trim() as TransactionType) || 'EXPENSE';
      
      if (!isNaN(value)) {
        transactions.push({
          id: generateId(),
          date,
          description,
          value,
          type,
          categoryId: columns[4]?.trim() || 'uncategorized', // Default or need mapping
          accountId: columns[5]?.trim() || 'default', // Default or need mapping
        });
      }
    }
  });

  return transactions;
};
