import { useState } from 'react';
import { Vistoria, VistoriaFormData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VistoriasTableProps {
  vistorias: Vistoria[];
  onDelete: (id: string) => void;
  onToggleNF?: (id: string) => void;
  onUpdatePagamento?: (id: string, tipo: string) => void;
  onEdit?: (id: string, data: Partial<VistoriaFormData>) => void;
}

export const VistoriasTable = ({ vistorias, onDelete, onToggleNF, onUpdatePagamento, onEdit }: VistoriasTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVistoria, setSelectedVistoria] = useState<Vistoria | null>(null);
  const [showActionsDialog, setShowActionsDialog] = useState(false);
  const [editingVistoria, setEditingVistoria] = useState<Vistoria | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editFormData, setEditFormData] = useState<VistoriaFormData>({
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

  const filteredVistorias = vistorias.filter(v => 
    v.placaChassi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.proprietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.cpf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (vistoria: Vistoria) => {
    setSelectedVistoria(vistoria);
    setShowActionsDialog(true);
  };

  const handleEditClick = () => {
    if (!selectedVistoria) return;
    setShowActionsDialog(false);
    setEditingVistoria(selectedVistoria);
    setEditFormData({
      placaChassi: selectedVistoria.placaChassi,
      responsavel: selectedVistoria.responsavel,
      cpf: selectedVistoria.cpf,
      dataVistoria: selectedVistoria.dataVistoria,
      dataPagamento: selectedVistoria.dataPagamento,
      tipoPagamento: selectedVistoria.tipoPagamento,
      proprietario: selectedVistoria.proprietario,
      nomeNoPix: selectedVistoria.nomeNoPix,
      notaFiscal: selectedVistoria.notaFiscal,
    });
  };

  const handleDeleteClick = () => {
    setShowActionsDialog(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedVistoria) {
      onDelete(selectedVistoria.id);
      setSelectedVistoria(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingVistoria && onEdit) {
      onEdit(editingVistoria.id, editFormData);
      setEditingVistoria(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getTipoPagamentoBadge = (tipo: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      'Pix': { variant: "default", className: "bg-blue-500 hover:bg-blue-600 text-xs" },
      'Dinheiro': { variant: "default", className: "bg-green-500 hover:bg-green-600 text-xs" },
      'Pendente': { variant: "destructive", className: "text-xs" }
    };
    
    const config = variants[tipo] || variants['Pendente'];
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {tipo}
      </Badge>
    );
  };

  return (
    <Card className="p-2 bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-lg h-full flex flex-col">
      <div className="mb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500" />
          <Input
            placeholder="Buscar por placa, responsável ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <div className="rounded-md border overflow-auto flex-1 min-h-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-emerald-50 to-green-50">
              <TableHead className="w-8 font-semibold text-xs py-2">Nº</TableHead>
              <TableHead className="font-semibold text-xs py-2">Placa</TableHead>
              <TableHead className="font-semibold text-xs py-2">Resp.</TableHead>
              <TableHead className="font-semibold text-xs py-2">CPF</TableHead>
              <TableHead className="font-semibold text-xs py-2">Dt. Vistoria</TableHead>
              <TableHead className="font-semibold text-xs py-2">Dt. Pag.</TableHead>
              <TableHead className="font-semibold text-xs py-2">Pag.</TableHead>
              <TableHead className="font-semibold text-xs py-2">Proprietário</TableHead>
              <TableHead className="font-semibold text-xs py-2">Nome no Pix</TableHead>
              <TableHead className="w-12 text-center font-semibold text-xs py-2">NF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVistorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-6 text-sm">
                  {searchTerm ? 'Nenhuma vistoria encontrada' : 'Nenhuma vistoria cadastrada ainda'}
                </TableCell>
              </TableRow>
            ) : (
              filteredVistorias.map((vistoria) => (
                <TableRow 
                  key={vistoria.id} 
                  className="hover:bg-emerald-50/50 transition-colors"
                >
                  <TableCell 
                    className="font-medium text-xs py-3 cursor-pointer hover:bg-emerald-100 hover:font-bold transition-colors"
                    onClick={() => handleRowClick(vistoria)}
                    title="Clique para editar ou excluir"
                  >
                    {vistoria.numero}
                  </TableCell>
                  <TableCell className="font-mono text-xs py-3 max-w-[100px] break-words select-text">{vistoria.placaChassi}</TableCell>
                  <TableCell className="text-xs py-3 max-w-[120px] break-words select-text">{vistoria.responsavel}</TableCell>
                  <TableCell className="font-mono text-xs py-3 max-w-[110px] break-words select-text">{vistoria.cpf}</TableCell>
                  <TableCell className="text-xs py-3 whitespace-nowrap select-text">{formatDate(vistoria.dataVistoria)}</TableCell>
                  <TableCell className="text-xs py-3 whitespace-nowrap select-text">{formatDate(vistoria.dataPagamento)}</TableCell>
                  <TableCell className="py-3">
                    <Select
                      value={vistoria.tipoPagamento}
                      onValueChange={(value) => onUpdatePagamento?.(vistoria.id, value)}
                    >
                      <SelectTrigger className="h-7 w-[100px] text-xs">
                        <SelectValue>
                          {getTipoPagamentoBadge(vistoria.tipoPagamento)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">
                          <Badge variant="destructive" className="text-xs">Pendente</Badge>
                        </SelectItem>
                        <SelectItem value="Pix">
                          <Badge className="bg-blue-500 text-xs">Pix</Badge>
                        </SelectItem>
                        <SelectItem value="Dinheiro">
                          <Badge className="bg-green-500 text-xs">Dinheiro</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs py-3 max-w-[130px] break-words select-text">{vistoria.proprietario}</TableCell>
                  <TableCell className="text-xs py-3 max-w-[130px] break-words select-text">{vistoria.nomeNoPix || '-'}</TableCell>
                  <TableCell className="text-center py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={vistoria.notaFiscal}
                      onCheckedChange={() => onToggleNF?.(vistoria.id)}
                      className="mx-auto h-4 w-4"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingVistoria} onOpenChange={() => setEditingVistoria(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Vistoria #{editingVistoria?.numero}</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias nos campos abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-placaChassi">Placa / Chassi</Label>
              <Input
                id="edit-placaChassi"
                value={editFormData.placaChassi}
                onChange={(e) => setEditFormData({ ...editFormData, placaChassi: e.target.value })}
                placeholder="ABC-1234 ou 9BW..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-responsavel">Responsável</Label>
              <Input
                id="edit-responsavel"
                value={editFormData.responsavel}
                onChange={(e) => setEditFormData({ ...editFormData, responsavel: e.target.value })}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cpf">CPF</Label>
              <Input
                id="edit-cpf"
                value={editFormData.cpf}
                onChange={(e) => setEditFormData({ ...editFormData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-dataVistoria">Data Vistoria</Label>
                <Input
                  id="edit-dataVistoria"
                  type="date"
                  value={editFormData.dataVistoria}
                  onChange={(e) => setEditFormData({ ...editFormData, dataVistoria: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dataPagamento">Data Pagamento</Label>
                <Input
                  id="edit-dataPagamento"
                  type="date"
                  value={editFormData.dataPagamento}
                  onChange={(e) => setEditFormData({ ...editFormData, dataPagamento: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tipoPagamento">Tipo de Pagamento</Label>
              <Select
                value={editFormData.tipoPagamento}
                onValueChange={(value: any) => setEditFormData({ ...editFormData, tipoPagamento: value })}
              >
                <SelectTrigger id="edit-tipoPagamento">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-proprietario">Proprietário</Label>
              <Input
                id="edit-proprietario"
                value={editFormData.proprietario}
                onChange={(e) => setEditFormData({ ...editFormData, proprietario: e.target.value })}
                placeholder="Nome do proprietário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nomeNoPix">Nome no Pix</Label>
              <Input
                id="edit-nomeNoPix"
                value={editFormData.nomeNoPix}
                onChange={(e) => setEditFormData({ ...editFormData, nomeNoPix: e.target.value })}
                placeholder="Nome cadastrado no Pix"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-notaFiscal"
                checked={editFormData.notaFiscal}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, notaFiscal: checked as boolean })}
              />
              <Label htmlFor="edit-notaFiscal" className="font-normal cursor-pointer">
                Nota Fiscal emitida
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingVistoria(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Ações */}
      <Dialog open={showActionsDialog} onOpenChange={setShowActionsDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ações - Vistoria #{selectedVistoria?.numero}</DialogTitle>
            <DialogDescription>
              Selecione uma ação para esta vistoria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <Button
              onClick={handleEditClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 justify-start"
              size="lg"
            >
              <Edit className="h-5 w-5" />
              Editar Vistoria
            </Button>
            
            <Button
              onClick={handleDeleteClick}
              variant="destructive"
              className="w-full gap-2 justify-start"
              size="lg"
            >
              <Trash2 className="h-5 w-5" />
              Excluir Vistoria
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowActionsDialog(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a vistoria #{selectedVistoria?.numero} do veículo {selectedVistoria?.placaChassi}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
