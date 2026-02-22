import { TransactionDto } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function exportToCSV(transactions: TransactionDto[], filename = 'transacoes') {
  if (!transactions || transactions.length === 0) {
    alert('Nenhuma transação para exportar');
    return;
  }

  // Headers
  const headers = [
    'Data',
    'Descrição',
    'Categoria',
    'Conta',
    'Tipo',
    'Valor',
  ];

  // Rows
  const rows = transactions.map((transaction) => [
    format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR }),
    transaction.description || '',
    transaction.categoryName || '',
    transaction.accountName || '',
    transaction.type === 0 ? 'Receita' : 'Despesa',
    transaction.amount.toFixed(2).replace('.', ','),
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.join(';')),
  ].join('\n');

  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(transactions: TransactionDto[], filename = 'transacoes') {
  if (!transactions || transactions.length === 0) {
    alert('Nenhuma transação para exportar');
    return;
  }

  // Create HTML table
  const table = document.createElement('table');

  // Header
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  ['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor'].forEach((text) => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.fontWeight = 'bold';
    th.style.backgroundColor = '#3b82f6';
    th.style.color = 'white';
    th.style.padding = '8px';
    headerRow.appendChild(th);
  });

  // Body
  const tbody = table.createTBody();
  transactions.forEach((transaction) => {
    const row = tbody.insertRow();

    const cells = [
      format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR }),
      transaction.description || '',
      transaction.categoryName || '',
      transaction.accountName || '',
      transaction.type === 0 ? 'Receita' : 'Despesa',
      `R$ ${transaction.amount.toFixed(2).replace('.', ',')}`,
    ];

    cells.forEach((text, index) => {
      const cell = row.insertCell();
      cell.textContent = text;
      cell.style.padding = '6px 8px';
      cell.style.border = '1px solid #ddd';

      // Color code for type
      if (index === 4) {
        cell.style.color = transaction.type === 0 ? '#10b981' : '#ef4444';
        cell.style.fontWeight = '600';
      }
    });
  });

  // Convert to Excel format (using HTML table method)
  const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Transações</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        ${table.outerHTML}
      </body>
    </html>
  `;

  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xls`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printTransactions(transactions: TransactionDto[]) {
  if (!transactions || transactions.length === 0) {
    alert('Nenhuma transação para imprimir');
    return;
  }

  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) return;

  const totalIncome = transactions
    .filter((t) => t.type === 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 1)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  printWindow.document.write(`
    <html>
      <head>
        <title>Transações - Orbit</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #3b82f6;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #3b82f6;
            color: white;
          }
          .income {
            color: #10b981;
            font-weight: 600;
          }
          .expense {
            color: #ef4444;
            font-weight: 600;
          }
          .summary {
            margin-top: 30px;
            padding: 20px;
            background-color: #f3f4f6;
            border-radius: 8px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .balance {
            font-size: 1.2em;
            font-weight: bold;
            padding-top: 10px;
            border-top: 2px solid #ddd;
          }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Relatório de Transações</h1>
        <p>Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (t) => `
              <tr>
                <td>${format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR })}</td>
                <td>${t.description || ''}</td>
                <td>${t.categoryName || ''}</td>
                <td class="${t.type === 0 ? 'income' : 'expense'}">
                  ${t.type === 0 ? 'Receita' : 'Despesa'}
                </td>
                <td class="${t.type === 0 ? 'income' : 'expense'}">
                  R$ ${t.amount.toFixed(2).replace('.', ',')}
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-item">
            <span>Total de Receitas:</span>
            <span class="income">R$ ${totalIncome.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="summary-item">
            <span>Total de Despesas:</span>
            <span class="expense">R$ ${totalExpense.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="summary-item balance">
            <span>Saldo:</span>
            <span style="color: ${balance >= 0 ? '#10b981' : '#ef4444'}">
              R$ ${balance.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Imprimir
        </button>
      </body>
    </html>
  `);

  printWindow.document.close();
}
