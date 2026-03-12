'use client';

import { useCallback } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExportButton({ targetRef }: ExportButtonProps) {
  const handleExportPNG = useCallback(async () => {
    if (!targetRef.current) return;
    try {
      const dataUrl = await toPng(targetRef.current, {
        quality: 1,
        backgroundColor: '#111827',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = 'funil-simulacao.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao exportar PNG:', err);
    }
  }, [targetRef]);

  const handleExportPDF = useCallback(async () => {
    if (!targetRef.current) return;
    try {
      const dataUrl = await toPng(targetRef.current, {
        quality: 1,
        backgroundColor: '#111827',
        pixelRatio: 2,
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const pdfWidth = 297;
      const pdfHeight = (img.height * pdfWidth) / img.width;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, Math.max(pdfHeight, 210)],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('funil-simulacao.pdf');
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    }
  }, [targetRef]);

  return (
    <div className="flex gap-3">
      <button
        onClick={handleExportPNG}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Exportar PNG
      </button>
      <button
        onClick={handleExportPDF}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Exportar PDF
      </button>
    </div>
  );
}
