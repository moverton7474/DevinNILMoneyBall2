import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

interface ExportColumn {
  header: string;
  accessorKey: string;
  width?: number;
}

interface ExportButtonProps {
  data: any[];
  filename?: string;
  columns?: ExportColumn[];
  title?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename = 'export',
  columns,
  title = 'Data Export'
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const prepareData = () => {
    if (!columns) {
      return data;
    }
    
    return data.map(row => {
      const exportRow: any = {};
      columns.forEach(col => {
        exportRow[col.header] = row[col.accessorKey] || '';
      });
      return exportRow;
    });
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const exportData = prepareData();
      const headers = columns ? columns.map(c => c.header) : Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const exportData = prepareData();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths if provided
      if (columns) {
        const colWidths = columns.map(col => ({ wch: col.width || 15 }));
        ws['!cols'] = colWidths;
      }
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      // Add metadata
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `${filename}_${today}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const exportData = prepareData();
      const doc = new jsPDF({
        orientation: columns && columns.length > 6 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, 20);
      
      // Add export date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Prepare table data
      const headers = columns ? columns.map(c => c.header) : Object.keys(exportData[0] || {});
      const rows = exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          return value?.toString() || '';
        })
      );
      
      // Add table
      (doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: 40,
        theme: 'grid',
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [29, 78, 216],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: columns ? columns.reduce((acc, col, idx) => {
          acc[idx] = { cellWidth: col.width || 'auto' };
          return acc;
        }, {} as any) : {},
        margin: { top: 40 },
        didDrawPage: (data: any) => {
          // Add footer with page numbers
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`, 
            doc.internal.pageSize.width - 20, 
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          );
        }
      });
      
      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      const exportData = prepareData();
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    } catch (error) {
      console.error('Error exporting JSON:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  if (data.length === 0) {
    return (
      <button
        disabled
        className="flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
      >
        <Download className="mr-2" size={16} />
        No Data to Export
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="mr-2" size={16} />
        {isExporting ? 'Exporting...' : 'Export'}
        <ChevronDown className="ml-2" size={16} />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
              Export {data.length} records as:
            </div>
            
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-sm"
            >
              <FileText className="mr-3 text-blue-600" size={16} />
              <div>
                <div className="font-medium">CSV File</div>
                <div className="text-xs text-gray-500">Comma-separated values</div>
              </div>
            </button>
            
            <button
              onClick={exportToExcel}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-sm"
            >
              <FileSpreadsheet className="mr-3 text-green-600" size={16} />
              <div>
                <div className="font-medium">Excel File</div>
                <div className="text-xs text-gray-500">Microsoft Excel format</div>
              </div>
            </button>
            
            <button
              onClick={exportToPDF}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-sm"
            >
              <File className="mr-3 text-red-600" size={16} />
              <div>
                <div className="font-medium">PDF Document</div>
                <div className="text-xs text-gray-500">Formatted report</div>
              </div>
            </button>
            
            <button
              onClick={exportToJSON}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-sm"
            >
              <File className="mr-3 text-purple-600" size={16} />
              <div>
                <div className="font-medium">JSON File</div>
                <div className="text-xs text-gray-500">JavaScript Object Notation</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};