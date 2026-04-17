import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { NotoSansRegular } from './fonts/NotoSans-Regular-normal.js';
import { NotoSansBold } from './fonts/NotoSans-Bold-bold.js';

function registerNotoSansFont(doc) {
  doc.addFileToVFS('NotoSans-Regular.ttf', NotoSansRegular);
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  doc.addFileToVFS('NotoSans-Bold.ttf', NotoSansBold);
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
}

export const exportProjectPDF = (project, expenses, categories, settings = {}) => {
  const doc = new jsPDF();
  registerNotoSansFont(doc);
  const currencySymbol = settings.currency || '₹';
  const displayFormat = settings.dateFormat || 'dd/MM/yyyy';
  
  const today = format(new Date(), displayFormat);
  
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;

  // Header - Midnight Blue Brand
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');
  
  doc.setTextColor(255);
  doc.setFontSize(22);
  doc.setFont('NotoSans', 'bold');
  doc.text('PROJECT LEDGER', margin, 20);

  doc.setFontSize(10);
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(245, 158, 11); // amber-500
  doc.text(`Generated on ${today}`, margin, 27);

  let startY = 46;

  // Project Info Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, startY, 182, 38, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('NotoSans', 'bold');
  doc.text(project.name.toUpperCase(), margin + 5, startY + 8);
  
  doc.setFontSize(10);
  doc.setFont('NotoSans', 'normal');
  doc.text(`Client/Payer: ${project.payerName}`, margin + 5, startY + 16);
  doc.text(`Ledger Status: ${project.status.toUpperCase()}`, margin + 5, startY + 22);

  // Stats
  doc.setFont('NotoSans', 'bold');
  doc.setTextColor(16, 185, 129); // emerald 
  doc.text(`Funds Received: ${currencySymbol}${(project.openingBalance || 0).toLocaleString('en-IN')}`, 115, startY + 10);
  
  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  doc.setTextColor(244, 63, 94); // rose
  doc.text(`Total Spends: ${currencySymbol}${totalSpent.toLocaleString('en-IN')}`, 115, startY + 18);

  const closingBal = (project.openingBalance || 0) - totalSpent;
  doc.setTextColor(245, 158, 11); // amber
  doc.text(`Closing Balance: ${currencySymbol}${closingBal.toLocaleString('en-IN')}`, 115, startY + 28);
  
  startY += 50;

  // Table
  const tableData = expenses.map(e => {
    const cat = categories.find(c => c.id === e.category);
    const catString = (cat?.name || e.category) + (e.provider ? ` (${e.provider})` : '');
    return [
      e.date ? format(new Date(e.date), displayFormat) : '-',
      catString,
      e.title || '-',
      `${currencySymbol}${(e.amount || 0).toLocaleString('en-IN')}`
    ];
  });

  doc.autoTable({
    startY,
    head: [['DATE', 'CATEGORY / PROVIDER', 'ITEM DESCRIPTION', 'AMOUNT']],
    body: tableData,
    theme: 'grid',
    styles: { font: 'NotoSans' },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [245, 158, 11], // amber text on midnight blue head
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [71, 85, 105], // slate-600
    },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' } // align amount to right
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    }
  });

  doc.save(`Project_Claim_${project.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
