import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { NotoSansRegular } from './fonts/NotoSans-Regular-normal.js';
import { NotoSansBold } from './fonts/NotoSans-Bold-bold.js';

function registerNotoSansFont(doc) {
  doc.addFileToVFS('NotoSans-Regular.ttf', NotoSansRegular);
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  doc.addFileToVFS('NotoSans-Bold.ttf', NotoSansBold);
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
}

export const exportLedgerPDF = (project, expenses, categories, settings = {}) => {
  try {
    const doc = new jsPDF();
    registerNotoSansFont(doc);
  const currencySymbol = settings.currency || '₹';
  const displayFormat = settings.dateFormat || 'dd/MM/yyyy';
  
  const today = format(new Date(), displayFormat);
  
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  // Header - Midnight Blue Brand
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 48, 'F');
  
  // Center align text
  doc.setTextColor(245, 158, 11); // Amber
  doc.setFontSize(10);
  doc.setFont('NotoSans', 'bold');
  doc.text('SMART LEDGER', pageWidth / 2, 16, { align: 'center' });

  doc.setTextColor(255);
  doc.setFontSize(24);
  doc.text(project.name.toUpperCase(), pageWidth / 2, 26, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('NotoSans', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated on ${today}  •  Total Transactions: ${expenses.length}`, pageWidth / 2, 34, { align: 'center' });
  
  if (project.payerName) {
    doc.text(`Client/Payer: ${project.payerName}`, pageWidth / 2, 40, { align: 'center' });
  }

  let startY = 56;

  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const closingBal = (project.openingBalance || 0) - totalSpent;

  // Top Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, startY, 182, 20, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('NotoSans', 'bold');
  doc.setTextColor(16, 185, 129); // emerald 
  doc.text(`Funds Received: ${currencySymbol}${(project.openingBalance || 0).toLocaleString('en-IN')}`, 20, startY + 12);
  
  doc.setTextColor(244, 63, 94); // rose
  doc.text(`Total Spends: ${currencySymbol}${totalSpent.toLocaleString('en-IN')}`, 85, startY + 12);

  doc.setTextColor(245, 158, 11); // amber
  doc.text(`Closing Balance: ${currencySymbol}${closingBal.toLocaleString('en-IN')}`, 145, startY + 12);
  
  startY += 30;

  // Table
  const tableData = expenses.map(e => {
    const cat = categories.find(c => c.id === e.category);
    const catString = (cat?.name || e.category) + (e.provider ? ` (${e.provider})` : '');
    
    // Safety check formatting
    const d = e.date ? new Date(e.date) : null;
    const safeDate = (d && !isNaN(d.getTime())) ? format(d, displayFormat) : '-';

    return [
      safeDate,
      catString,
      e.title || '-',
      `${currencySymbol}${(e.amount || 0).toLocaleString('en-IN')}`
    ];
  });

    autoTable(doc, {
      startY,
      head: [['DATE', 'CATEGORY / PROVIDER', 'ITEM DESCRIPTION', 'AMOUNT']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [245, 158, 11], // amber text on midnight blue head
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        font: 'NotoSans',
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

    // Bottom Summary Box
    const finalY = doc.lastAutoTable.finalY + 12;
    doc.setFillColor(255, 251, 235); // amber-50 background for emphasis
    doc.setDrawColor(245, 158, 11); // amber-500 border
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, finalY, 182, 28, 3, 3, 'FD');

    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('FINAL LEDGER SETTLEMENT', margin + 5, finalY + 8);

    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text(`Received: ${currencySymbol}${(project.openingBalance || 0).toLocaleString('en-IN')}`, margin + 5, finalY + 18);
    
    doc.setTextColor(244, 63, 94);
    doc.text(`Total Spends: ${currencySymbol}${totalSpent.toLocaleString('en-IN')}`, margin + 65, finalY + 18);

    doc.setTextColor(245, 158, 11);
    doc.text(`Closing Balance: ${currencySymbol}${closingBal.toLocaleString('en-IN')}`, margin + 125, finalY + 18);

    doc.save(`Project_Claim_${project.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } catch (error) {
    throw new Error(error.message || "Failed to embed PDF layout or unresolvable unicode font logic.");
  }
}
