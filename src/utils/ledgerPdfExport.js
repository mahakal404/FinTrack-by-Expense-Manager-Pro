import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { NotoSansRegular } from './fonts/NotoSans-Regular-normal.js';
import { NotoSansBold } from './fonts/NotoSans-Bold-bold.js';
import db from './db'; // LocalForage storage

function registerNotoSansFont(doc) {
  doc.addFileToVFS('NotoSans-Regular.ttf', NotoSansRegular);
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  doc.addFileToVFS('NotoSans-Bold.ttf', NotoSansBold);
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
}

/**
 * Enhanced PDF Export for Smart Ledger
 * @param {Object} project - Ledger details
 * @param {Array} expenses - Entries
 * @param {Array} categories - Category definitions
 * @param {Object} settings - User preferences (currency, dateFormat)
 * @param {Object} options - Export settings { includeReceipts: true|false }
 */
export const exportLedgerPDF = async (project, expenses, categories, settings = {}, options = { includeReceipts: true }) => {
  const { includeReceipts = true } = options;
  const tempBlobUrls = []; // Track to potentially revoke (though PDF viewer needs them to stay active)

  try {
    const imageMap = {};
    const blobUrlMap = {};

    // 1. Pre-load Blobs from LocalForage (IndexedDB)
    if (includeReceipts) {
      for (const e of expenses) {
        if (e.receiptUrl) {
          try {
            // Check if it's a local key or a legacy cloud URL
            let blob;
            if (e.receiptUrl.startsWith('receipt_')) {
              blob = await db.getItem(e.receiptUrl);
            } else if (e.receiptUrl.startsWith('http') || e.receiptUrl.startsWith('blob:')) {
              const res = await fetch(e.receiptUrl);
              blob = await res.blob();
            }

            if (blob) {
              // Store temporary blob URL for clickable links in the PDF
              const bUrl = URL.createObjectURL(blob);
              blobUrlMap[e.id] = bUrl;
              tempBlobUrls.push(bUrl);

              if (blob.type.includes('image')) {
                const base64 = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.readAsDataURL(blob);
                });
                imageMap[e.id] = base64;
              }
            }
          } catch (err) {
            console.warn(`[PDF Export] Could not load receipt for entry ${e.id}:`, err);
          }
        }
      }
    }

    const doc = new jsPDF();
    registerNotoSansFont(doc);
    const currencySymbol = settings.currency || '₹';
    const displayFormat = settings.dateFormat || 'dd/MM/yyyy';
    const today = format(new Date(), displayFormat);
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;

    // Header Panel
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 48, 'F');
    
    doc.setTextColor(245, 158, 11); // Amber
    doc.setFontSize(10);
    doc.setFont('NotoSans', 'bold');
    doc.text('SMART LEDGER REPORT', pageWidth / 2, 16, { align: 'center' });

    doc.setTextColor(255);
    doc.setFontSize(22);
    doc.text((project.name || 'LEDGER').toUpperCase(), pageWidth / 2, 26, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('NotoSans', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Generated: ${today}  •  Transactions: ${expenses.length}  •  Mode: ${includeReceipts ? 'Detailed' : 'Summary'}`, pageWidth / 2, 34, { align: 'center' });
    
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
    doc.setTextColor(16, 185, 129); 
    doc.text(`Funds: ${currencySymbol}${(project.openingBalance || 0).toLocaleString('en-IN')}`, margin + 6, startY + 12);
    
    doc.setTextColor(244, 63, 94);
    doc.text(`Spent: ${currencySymbol}${totalSpent.toLocaleString('en-IN')}`, margin + 65, startY + 12);

    doc.setTextColor(245, 158, 11);
    doc.text(`Balance: ${currencySymbol}${closingBal.toLocaleString('en-IN')}`, margin + 125, startY + 12);
    
    startY += 30;

    // Table Logic
    const headers = ['DATE', 'CATEGORY', 'ITEM DESCRIPTION', 'AMOUNT'];
    if (includeReceipts) headers.push('RECEIPT');

    const tableData = expenses.map(e => {
      const cat = categories.find(c => c.id === e.category);
      const catString = (cat?.name || e.category) + (e.provider ? ` (${e.provider})` : '');
      const d = e.date ? new Date(e.date) : null;
      const safeDate = (d && !isNaN(d.getTime())) ? format(d, displayFormat) : '-';

      const row = [
        safeDate,
        catString,
        e.title || '-',
        `${currencySymbol}${(e.amount || 0).toLocaleString('en-IN')}`
      ];

      if (includeReceipts) {
        const hasReceipt = !!e.receiptUrl;
        let receiptLabel = '-';
        if (hasReceipt) {
          const isPdf = e.receiptUrl.includes('.pdf') || (blobUrlMap[e.id] && e.receiptUrl.startsWith('receipt_') && !imageMap[e.id]);
          receiptLabel = isPdf ? 'View PDF' : (imageMap[e.id] ? '' : 'View Image');
        }
        row.push(receiptLabel);
      }
      return row;
    });

    autoTable(doc, {
      startY,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [245, 158, 11], fontStyle: 'bold', fontSize: 9 },
      styles: { font: 'NotoSans', fontSize: 9, cellPadding: 4, textColor: [71, 85, 105], valign: 'middle' },
      columnStyles: {
        [headers.indexOf('AMOUNT')]: { halign: 'right', fontStyle: 'bold' },
        ...(includeReceipts ? { [headers.indexOf('RECEIPT')]: { halign: 'center' } } : {})
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: function(data) {
        if (includeReceipts && data.column.index === headers.indexOf('RECEIPT') && data.cell.section === 'body') {
           const exp = expenses[data.row.index];
           if (imageMap[exp.id]) {
             data.row.minHeight = 18;
           }
        }
      },
      didDrawCell: function(data) {
        if (includeReceipts && data.column.index === headers.indexOf('RECEIPT') && data.cell.section === 'body') {
           const exp = expenses[data.row.index];
           const bUrl = blobUrlMap[exp.id];
           
           if (bUrl) {
              if (imageMap[exp.id]) {
                const imgX = data.cell.x + 4;
                const imgY = data.cell.y + 2.5;
                const imgW = 13;
                const imgH = 13;
                doc.addImage(imageMap[exp.id], 'JPEG', imgX, imgY, imgW, imgH);
                // Make the image clickable
                doc.link(imgX, imgY, imgW, imgH, { url: bUrl });
              } else {
                doc.setTextColor(59, 130, 246);
                doc.setFontSize(8);
                const isPdf = exp.receiptUrl.toLowerCase().includes('.pdf');
                doc.textWithLink(isPdf ? 'View PDF' : 'View Image', data.cell.x + 4, data.cell.y + (data.row.height / 2) + 1.5, { url: bUrl });
              }
           }
        }
      }
    });

    // Final Footer Settlements
    const finalY = doc.lastAutoTable.finalY + 12;
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, finalY, 182, 28, 3, 3, 'FD');

    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('FINAL LEDGER SUMMARY', margin + 6, finalY + 9);

    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text(`Received: ${currencySymbol}${(project.openingBalance || 0).toLocaleString('en-IN')}`, margin + 6, finalY + 19);
    
    doc.setTextColor(244, 63, 94);
    doc.text(`Spent: ${currencySymbol}${totalSpent.toLocaleString('en-IN')}`, margin + 65, finalY + 19);

    doc.setTextColor(245, 158, 11);
    doc.text(`Balance: ${currencySymbol}${closingBal.toLocaleString('en-IN')}`, margin + 125, finalY + 19);

    doc.save(`Ledger_${project.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  } catch (error) {
    console.error('[PDF Export Logic Error]:', error);
    throw new Error(error.message || "Failed to generate sophisticated PDF layout.");
  }
}
