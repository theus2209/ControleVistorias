import { useState } from 'react';
import { VistoriaFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

interface VistoriaFormProps {
  onSubmit: (data: VistoriaFormData) => Promise<void>;
}

export const VistoriaForm = ({ onSubmit }: VistoriaFormProps) => {
  const [formData, setFormData] = useState<VistoriaFormData>({
    placaChassi: '',
    responsavel: '',
    cpf: '',
    dataVistoria: '',
    dataPagamento: '',
    tipoPagamento: 'Pendente',
    proprietario: '',
    nomeNoPix: '',
    notaFiscal: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
    
    // Reset form
    setFormData({
      placaChassi: '',
      responsavel: '',
      cpf: '',
      dataVistoria: '',
      dataPagamento: '',
      tipoPagamento: 'Pendente',
      proprietario: '',
      nomeNoPix: '',
      notaFiscal: false,
    });
  };

  return (
    <Card className="p-3 bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-lg h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <PlusCircle className="h-4 w-4 text-emerald-600" />
        <h2 className="text-sm font-semibold">Nova Vistoria</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-1.5 flex-1 overflow-y-auto pr-1 min-h-0">
        <div className="space-y-1">
          <Label htmlFor="placaChassi" className="text-xs">Placa / Chassi</Label>
          <Input
            id="placaChassi"
            value={formData.placaChassi}
            onChange={(e) => setFormData({ ...formData, placaChassi: e.target.value })}
            placeholder="ABC-1234 ou 9BW..."
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="responsavel" className="text-xs">Responsável</Label>
          <Input
            id="responsavel"
            value={formData.responsavel}
            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
            placeholder="Nome do responsável"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="dataVistoria" className="text-xs">Data Vistoria</Label>
            <Input
              id="dataVistoria"
              type="date"
              value={formData.dataVistoria}
              onChange={(e) => setFormData({ ...formData, dataVistoria: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="dataPagamento" className="text-xs">Data Pagamento</Label>
            <Input
              id="dataPagamento"
              type="date"
              value={formData.dataPagamento}
              onChange={(e) => setFormData({ ...formData, dataPagamento: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="tipoPagamento" className="text-xs">Tipo de Pagamento</Label>
          <Select
            value={formData.tipoPagamento}
            onValueChange={(value: any) => setFormData({ ...formData, tipoPagamento: value })}
          >
            <SelectTrigger id="tipoPagamento">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Pix">Pix</SelectItem>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="proprietario" className="text-xs">Proprietário</Label>
          <Input
            id="proprietario"
            value={formData.proprietario}
            onChange={(e) => setFormData({ ...formData, proprietario: e.target.value })}
            placeholder="Nome do proprietário"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cpf" className="text-xs">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="nomeNoPix" className="text-xs">Nome no Pix</Label>
          <Input
            id="nomeNoPix"
            value={formData.nomeNoPix}
            onChange={(e) => setFormData({ ...formData, nomeNoPix: e.target.value })}
            placeholder="Nome cadastrado no Pix"
          />
        </div>

        <div className="pt-2 sticky bottom-0 bg-gradient-to-br from-white to-emerald-50">
          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-semibold shadow-md text-sm py-2"
          >
            {submitting ? 'Adicionando...' : 'Adicionar Vistoria'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
