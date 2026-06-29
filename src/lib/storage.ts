import { Vistoria, VistoriaFormData } from '@/types';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Controle de Vistorias', 14, 20);
    
    // Data de exportação
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataExportacao = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Data de exportação: ${dataExportacao}`, 14, 28);

    // Preparar dados da tabela
    const headers = [['Nº', 'Placa/Chassi', 'Resp.', 'CPF', 'Dt. Vistoria', 'Dt. Pag.', 'Pag.', 'Proprietário', 'Nome no Pix', 'NF']];
    
    const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}`;
    };

    const rows = vistorias.map(v => [
      v.numero.toString(),
      v.placaChassi,
      v.responsavel,
      v.cpf || '-',
      formatDate(v.dataVistoria),
      formatDate(v.dataPagamento),
      v.tipoPagamento,
      v.proprietario,
      v.nomeNoPix || '-',
      v.notaFiscal ? 'ok' : '-'
    ]);

    // Criar tabela
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [54, 126, 235],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', overflow: 'visible' },
        1: { cellWidth: 20 },
        2: { cellWidth: 22, overflow: 'visible' },
        3: { cellWidth: 22, fontSize: 8 },
        4: { cellWidth: 14, halign: 'center', overflow: 'visible' },
        5: { cellWidth: 14, halign: 'center', overflow: 'visible' },
        6: { cellWidth: 16, halign: 'center' },
        7: { cellWidth: 24 },
        8: { cellWidth: 24 },
        9: { cellWidth: 10, halign: 'center' }
      },
      margin: { top: 35, left: 14, right: 14 },
      didParseCell: (data) => {
        // Aplicar cores de texto na coluna de pagamento (índice 6)
        if (data.column.index === 6 && data.section === 'body') {
          const valor = data.cell.text[0];
          if (valor === 'Pix') {
            data.cell.styles.textColor = [59, 130, 246]; // Azul
            data.cell.styles.fontStyle = 'bold';
          } else if (valor === 'Dinheiro') {
            data.cell.styles.textColor = [34, 197, 94]; // Verde
            data.cell.styles.fontStyle = 'bold';
          } else if (valor === 'Pendente') {
            data.cell.styles.textColor = [239, 68, 68]; // Vermelho
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      didDrawPage: (data) => {
        // Rodapé com número de página
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(128);
        const pageText = `Página ${data.pageNumber} de ${pageCount}`;
        doc.text(pageText, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
    });

    // Estatísticas no final
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo:', 14, finalY);
    
    doc.setFont('helvetica', 'normal');
    const total = vistorias.length;
    const pagas = vistorias.filter(v => v.tipoPagamento !== 'Pendente').length;
    const pendentes = vistorias.filter(v => v.tipoPagamento === 'Pendente').length;
    const comNF = vistorias.filter(v => v.notaFiscal).length;
    
    doc.text(`Total de Vistorias: ${total}`, 14, finalY + 7);
    doc.text(`Pagas: ${pagas}`, 14, finalY + 14);
    doc.text(`Pendentes: ${pendentes}`, 14, finalY + 21);
    doc.text(`Com Nota Fiscal: ${comNF}`, 14, finalY + 28);

    return doc;
  }
};
