import { useVistorias } from '@/hooks/useVistorias';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/features/StatsCards';
import { VistoriaForm } from '@/components/features/VistoriaForm';
import { VistoriasTable } from '@/components/features/VistoriasTable';
import { VistoriaFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const Home = () => {
  const { vistorias, stats, addVistoria, updateVistoria, deleteVistoria, clearAll, exportToPDF } = useVistorias();
  const { toast } = useToast();

  const handleAddVistoria = async (formData: VistoriaFormData) => {
    console.log('Adding vistoria:', formData);
    try {
      await addVistoria(formData);
      toast({
        title: "Vistoria adicionada!",
        description: `Vistoria do veículo ${formData.placaChassi} registrada com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteVistoria = async (id: string) => {
    const vistoria = vistorias.find(v => v.id === id);
    try {
      await deleteVistoria(id);
      toast({
        title: "Vistoria removida",
        description: `Vistoria ${vistoria?.numero} foi excluída.`,
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    exportToPDF();
    toast({
      title: "Exportação concluída!",
      description: "Os dados foram exportados para PDF com sucesso.",
    });
  };

  const handleToggleNF = async (id: string) => {
    const vistoria = vistorias.find(v => v.id === id);
    if (vistoria) {
      try {
        await updateVistoria(id, { notaFiscal: !vistoria.notaFiscal });
        toast({
          title: vistoria.notaFiscal ? "NF desmarcada" : "NF marcada",
          description: `Nota fiscal ${!vistoria.notaFiscal ? "emitida" : "removida"} para a vistoria ${vistoria.numero}.`,
        });
      } catch (error: any) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdatePagamento = async (id: string, tipo: string) => {
    const vistoria = vistorias.find(v => v.id === id);
    if (vistoria) {
      try {
        await updateVistoria(id, { tipoPagamento: tipo as any });
        toast({
          title: "Pagamento atualizado",
          description: `Tipo de pagamento alterado para ${tipo} na vistoria ${vistoria.numero}.`,
        });
      } catch (error: any) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      toast({
        title: "Todas as vistorias foram apagadas",
        description: "Todos os registros foram removidos permanentemente.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao apagar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditVistoria = async (id: string, data: Partial<VistoriaFormData>) => {
    const vistoria = vistorias.find(v => v.id === id);
    if (vistoria) {
      try {
        await updateVistoria(id, data);
        toast({
          title: "Vistoria atualizada",
          description: `Vistoria ${vistoria.numero} foi atualizada com sucesso.`,
        });
      } catch (error: any) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <Header onExport={handleExport} onClearAll={handleClearAll} />
      
      <main className="container mx-auto px-4 py-4 flex-1 flex flex-col overflow-hidden">
        <div className="mb-4 flex-shrink-0">
          <StatsCards stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
          <div className="lg:col-span-3 overflow-hidden">
            <VistoriasTable 
              vistorias={vistorias} 
              onDelete={handleDeleteVistoria}
              onToggleNF={handleToggleNF}
              onUpdatePagamento={handleUpdatePagamento}
              onEdit={handleEditVistoria}
            />
          </div>
          
          <div className="overflow-hidden">
            <VistoriaForm onSubmit={handleAddVistoria} />
          </div>
        </div>
      </main>
    </div>
  );
};
