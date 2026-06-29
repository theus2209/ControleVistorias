import { useState, useEffect, useCallback } from 'react';
import { Vistoria, VistoriaFormData, VistoriaStats } from '@/types';
import { storageService } from '@/lib/storage';

export const useVistorias = () => {
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVistorias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storageService.getVistorias();
      setVistorias(data);
    } catch (error) {
      console.error('Erro ao carregar vistorias:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVistorias();
  }, [loadVistorias]);

  const addVistoria = useCallback(async (formData: VistoriaFormData) => {
    const nova = await storageService.addVistoria(formData);
    setVistorias(prev => [nova, ...prev]);
    return nova;
  }, []);

  const updateVistoria = useCallback(async (id: string, data: Partial<VistoriaFormData>) => {
    const updated = await storageService.updateVistoria(id, data);
    if (updated) {
      setVistorias(prev => prev.map(v => v.id === id ? updated : v));
    }
    return updated;
  }, []);

  const deleteVistoria = useCallback(async (id: string) => {
    const success = await storageService.deleteVistoria(id);
    if (success) {
      setVistorias(prev => prev.filter(v => v.id !== id));
    }
    return success;
  }, []);

  const stats: VistoriaStats = {
    total: vistorias.length,
    pagas: vistorias.filter(v => v.tipoPagamento !== 'Pendente').length,
    pix: vistorias.filter(v => v.tipoPagamento === 'Pix').length,
    dinheiro: vistorias.filter(v => v.tipoPagamento === 'Dinheiro').length,
    pendentes: vistorias.filter(v => v.tipoPagamento === 'Pendente').length,
    comNF: vistorias.filter(v => v.notaFiscal).length,
  };

  const exportToPDF = useCallback(() => {
    const pdf = storageService.exportToPDF(vistorias);
    pdf.save(`vistorias_${new Date().toISOString().split('T')[0]}.pdf`);
  }, [vistorias]);

  const clearAll = useCallback(async () => {
    await storageService.clearAllVistorias();
    setVistorias([]);
  }, []);

  return {
    vistorias,
    loading,
    addVistoria,
    updateVistoria,
    deleteVistoria,
    clearAll,
    stats,
    exportToPDF,
    refresh: loadVistorias
  };
};
