import { Vistoria, VistoriaFormData } from '@/types';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';

export const storageService = {
  getVistorias: async (): Promise<Vistoria[]> => {
    const { data, error } = await supabase
      .from('vistorias')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(row => ({
      id: row.id,
      numero: row.numero,
      placaChassi: row.placa_chassi,
      responsavel: row.responsavel,
      cpf: row.cpf,
      dataVistoria: row.data_vistoria,
      dataPagamento: row.data_pagamento || '',
      tipoPagamento: row.tipo_pagamento,
      proprietario: row.proprietario,
      nomeNoPix: row.nome_no_pix || '',
      notaFiscal: row.nota_fiscal,
      createdAt: row.created_at,
    }));
  },

  addVistoria: async (formData: VistoriaFormData): Promise<Vistoria> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: maxNumeroData } = await supabase
      .from('vistorias')
      .select('numero')
      .eq('user_id', user.id)
      .order('numero', { ascending: false })
      .limit(1);
    
    const numero = maxNumeroData && maxNumeroData.length > 0 ? maxNumeroData[0].numero + 1 : 1;

    const { data, error } = await supabase
      .from('vistorias')
      .insert({
        numero,
        placa_chassi: formData.placaChassi,
        responsavel: formData.responsavel,
        cpf: formData.cpf,
        data_vistoria: formData.dataVistoria,
        data_pagamento: formData.dataPagamento || null,
        tipo_pagamento: formData.tipoPagamento,
        proprietario: formData.proprietario,
        nome_no_pix: formData.nomeNoPix || '',
        nota_fiscal: formData.notaFiscal,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;

    return {
      id: data.id,
      numero: data.numero,
      placaChassi: data.placa_chassi,
      responsavel: data.responsavel,
      cpf: data.cpf,
      dataVistoria: data.data_vistoria,
      dataPagamento: data.data_pagamento || '',
      tipoPagamento: data.tipo_pagamento,
      proprietario: data.proprietario,
      nomeNoPix: data.nome_no_pix || '',
      notaFiscal: data.nota_fiscal,
      createdAt: data.created_at,
    };
  },

  updateVistoria: async (id: string, formData: Partial<VistoriaFormData>): Promise<Vistoria | null> => {
    const updateData: any = {};
    if (formData.placaChassi !== undefined) updateData.placa_chassi = formData.placaChassi;
    if (formData.responsavel !== undefined) updateData.responsavel = formData.responsavel;
    if (formData.cpf !== undefined) updateData.cpf = formData.cpf;
    if (formData.dataVistoria !== undefined) updateData.data_vistoria = formData.dataVistoria;
    if (formData.dataPagamento !== undefined) updateData.data_pagamento = formData.dataPagamento || null;
    if (formData.tipoPagamento !== undefined) updateData.tipo_pagamento = formData.tipoPagamento;
    if (formData.proprietario !== undefined) updateData.proprietario = formData.proprietario;
    if (formData.nomeNoPix !== undefined) updateData.nome_no_pix = formData.nomeNoPix;
    if (formData.notaFiscal !== undefined) updateData.nota_fiscal = formData.notaFiscal;

    const { data, error } = await supabase
      .from('vistorias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      numero: data.numero,
      placaChassi: data.placa_chassi,
      responsavel: data.responsavel,
      cpf: data.cpf,
      dataVistoria: data.data_vistoria,
      dataPagamento: data.data_pagamento || '',
      tipoPagamento: data.tipo_pagamento,
      proprietario: data.proprietario,
      nomeNoPix: data.nome_no_pix || '',
      notaFiscal: data.nota_fiscal,
      createdAt: data.created_at,
    };
  },

  deleteVistoria: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('vistorias')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  clearAllVistorias: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('vistorias')
      .delete()
      .eq('user_id', user.id);
    
    if (error) throw error;
  },

  exportToPDF: (vistorias: Vistoria[]): jsPDF => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginL = 10;
    const marginR = 10;
    const usableW = pageW - marginL - marginR;

    const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      const [, month, day] = dateString.split('-');
      return `${day}/${month}`;
    };

    // Colunas: widths somam usableW (277mm em landscape A4)
    const cols = [
      { label: 'Nº',           width: 10, align: 'center' as const },
      { label: 'Placa/Chassi', width: 28, align: 'left'   as const },
      { label: 'Resp.',        width: 26, align: 'left'   as const },
      { label: 'CPF',          width: 30, align: 'left'   as const },
      { label: 'Dt. Vistoria', width: 18, align: 'center' as const },
      { label: 'Dt. Pag.',     width: 18, align: 'center' as const },
      { label: 'Pag.',         width: 20, align: 'center' as const },
      { label: 'Proprietário', width: 57, align: 'left'   as const },
      { label: 'Nome no Pix',  width: 57, align: 'left'   as const },
      { label: 'NF',           width: 13, align: 'center' as const },
    ];

    const rowH = 7;
    const headerH = 9;
    const fontSize = 8;
    const headerFontSize = 8;
    let y = 0;

    const drawHeader = (pageNum: number) => {
      // Page title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Controle de Vistorias', marginL, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const dataExportacao = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      doc.text(`Data de exportação: ${dataExportacao}`, marginL, 19);

      // Table header background
      doc.setFillColor(54, 126, 235);
      doc.rect(marginL, 23, usableW, headerH, 'F');

      doc.setFontSize(headerFontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);

      let x = marginL;
      cols.forEach(col => {
        const tx = col.align === 'center' ? x + col.width / 2 : x + 1;
        doc.text(col.label, tx, 23 + headerH - 2, { align: col.align === 'center' ? 'center' : 'left', maxWidth: col.width - 2 });
        x += col.width;
      });

      return 23 + headerH; // y after header
    };

    const drawPageNumber = (pageNum: number, total: number) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${pageNum} de ${total}`, pageW / 2, pageH - 5, { align: 'center' });
    };

    const getPagColor = (tipo: string): [number, number, number] => {
      if (tipo === 'Pix') return [59, 130, 246];
      if (tipo === 'Dinheiro') return [34, 197, 94];
      return [239, 68, 68];
    };

    // First page header
    y = drawHeader(1);

    doc.setFontSize(fontSize);

    vistorias.forEach((v, idx) => {
      const row = [
        v.numero.toString(),
        v.placaChassi,
        v.responsavel,
        v.cpf || '-',
        formatDate(v.dataVistoria),
        formatDate(v.dataPagamento),
        v.tipoPagamento,
        v.proprietario,
        v.nomeNoPix || '-',
        v.notaFiscal ? 'ok' : '-',
      ];

      // Check if we need a new page
      if (y + rowH > pageH - 15) {
        // page number on current page (placeholder, will fix after)
        doc.addPage();
        y = drawHeader(doc.internal.getNumberOfPages());
        doc.setFontSize(fontSize);
      }

      // Alternate row background
      if (idx % 2 === 1) {
        doc.setFillColor(240, 248, 255);
        doc.rect(marginL, y, usableW, rowH, 'F');
      }

      // Row border
      doc.setDrawColor(200, 200, 200);
      doc.rect(marginL, y, usableW, rowH);

      // Cell content
      let x = marginL;
      cols.forEach((col, ci) => {
        // Cell vertical border
        if (ci > 0) {
          doc.setDrawColor(200, 200, 200);
          doc.line(x, y, x, y + rowH);
        }

        doc.setFont('helvetica', 'normal');

        if (ci === 6) {
          // Payment column: colored text
          const [r, g, b] = getPagColor(row[ci]);
          doc.setTextColor(r, g, b);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setTextColor(0, 0, 0);
        }

        const tx = col.align === 'center' ? x + col.width / 2 : x + 1;
        const cellText = doc.splitTextToSize(row[ci], col.width - 2);
        const lineToShow = cellText[0] || '';
        doc.text(lineToShow, tx, y + rowH - 2, { align: col.align === 'center' ? 'center' : 'left' });

        x += col.width;
      });

      y += rowH;
    });

    // Summary
    y += 6;
    if (y + 35 > pageH - 15) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Resumo:', marginL, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const total = vistorias.length;
    const pagas = vistorias.filter(v => v.tipoPagamento !== 'Pendente').length;
    const pendentes = vistorias.filter(v => v.tipoPagamento === 'Pendente').length;
    const comNF = vistorias.filter(v => v.notaFiscal).length;

    doc.text(`Total de Vistorias: ${total}`, marginL, y + 7);
    doc.text(`Pagas: ${pagas}`, marginL, y + 14);
    doc.text(`Pendentes: ${pendentes}`, marginL, y + 21);
    doc.text(`Com Nota Fiscal: ${comNF}`, marginL, y + 28);

    // Add page numbers to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawPageNumber(p, totalPages);
    }

    return doc;
  }
};
