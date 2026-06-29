import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gasto, GastoFormData, Credito, CreditoFormData } from '@/types';
import { gastosCreditosService } from '@/lib/gastosCreditos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const GastosCreditos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para formulário de Gastos
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [gastoForm, setGastoForm] = useState<GastoFormData>({ data: '', descricao: '', valor: 0 });
  const [editingGasto, setEditingGasto] = useState<string | null>(null);
  
  // Estados para formulário de Créditos
  const [showCreditoForm, setShowCreditoForm] = useState(false);
  const [creditoForm, setCreditoForm] = useState<CreditoFormData>({ cliente: '', saldoAnterior: 0, saldoAtual: 0 });
  const [editingCredito, setEditingCredito] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gastosData, creditosData] = await Promise.all([
        gastosCreditosService.getGastos(),
        gastosCreditosService.getCreditos()
      ]);
      setGastos(gastosData);
      setCreditos(creditosData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Gastos
  const handleAddGasto = async () => {
    try {
      const novoGasto = await gastosCreditosService.addGasto(gastoForm);
      setGastos([novoGasto, ...gastos]);
      setGastoForm({ data: '', descricao: '', valor: 0 });
      setShowGastoForm(false);
      toast({
        title: "Gasto adicionado!",
        description: "O gasto foi registrado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar gasto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditGasto = (gasto: Gasto) => {
    setEditingGasto(gasto.id);
    setGastoForm({ data: gasto.data, descricao: gasto.descricao, valor: gasto.valor });
    setShowGastoForm(true);
  };

  const handleUpdateGasto = async () => {
    if (!editingGasto) return;
    try {
      const updated = await gastosCreditosService.updateGasto(editingGasto, gastoForm);
      if (updated) {
        setGastos(gastos.map(g => g.id === editingGasto ? updated : g));
        setEditingGasto(null);
        setGastoForm({ data: '', descricao: '', valor: 0 });
        setShowGastoForm(false);
        toast({
          title: "Gasto atualizado!",
          description: "O gasto foi atualizado com sucesso.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar gasto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteGasto = async (id: string) => {
    try {
      await gastosCreditosService.deleteGasto(id);
      setGastos(gastos.filter(g => g.id !== id));
      toast({
        title: "Gasto removido",
        description: "O gasto foi excluído com sucesso.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao deletar gasto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handlers para Créditos
  const handleAddCredito = async () => {
    try {
      const novoCredito = await gastosCreditosService.addCredito(creditoForm);
      setCreditos([...creditos, novoCredito]);
      setCreditoForm({ cliente: '', saldoAnterior: 0, saldoAtual: 0 });
      setShowCreditoForm(false);
      toast({
        title: "Crédito adicionado!",
        description: "O crédito foi registrado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar crédito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditCredito = (credito: Credito) => {
    setEditingCredito(credito.id);
    setCreditoForm({ cliente: credito.cliente, saldoAnterior: credito.saldoAnterior, saldoAtual: credito.saldoAtual });
    setShowCreditoForm(true);
  };

  const handleUpdateCredito = async () => {
    if (!editingCredito) return;
    try {
      const updated = await gastosCreditosService.updateCredito(editingCredito, creditoForm);
      if (updated) {
        setCreditos(creditos.map(c => c.id === editingCredito ? updated : c));
        setEditingCredito(null);
        setCreditoForm({ cliente: '', saldoAnterior: 0, saldoAtual: 0 });
        setShowCreditoForm(false);
        toast({
          title: "Crédito atualizado!",
          description: "O crédito foi atualizado com sucesso.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar crédito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCredito = async (id: string) => {
    try {
      await gastosCreditosService.deleteCredito(id);
      setCreditos(creditos.filter(c => c.id !== id));
      toast({
        title: "Crédito removido",
        description: "O crédito foi excluído com sucesso.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao deletar crédito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <header className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold">Gastos e Créditos</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabela de Gastos */}
          <Card className="p-4 bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-emerald-800">Gastos</h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingGasto(null);
                  setGastoForm({ data: '', descricao: '', valor: 0 });
                  setShowGastoForm(true);
                }}
                className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <div className="rounded-md border overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-emerald-50 to-green-50">
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Descrição</TableHead>
                    <TableHead className="font-semibold text-right">Valor</TableHead>
                    <TableHead className="w-20 text-center font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gastos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum gasto cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    gastos.map((gasto) => (
                      <TableRow key={gasto.id} className="hover:bg-emerald-50/50">
                        <TableCell>{formatDate(gasto.data)}</TableCell>
                        <TableCell>{gasto.descricao}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(gasto.valor)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGasto(gasto)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGasto(gasto.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {gastos.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total de Gastos:</span>
                  <span className="font-bold text-xl text-red-600">
                    {formatCurrency(gastos.reduce((sum, g) => sum + g.valor, 0))}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Tabela de Créditos */}
          <Card className="p-4 bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-emerald-800">Créditos de Clientes</h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingCredito(null);
                  setCreditoForm({ cliente: '', saldoAnterior: 0, saldoAtual: 0 });
                  setShowCreditoForm(true);
                }}
                className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <div className="rounded-md border overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-emerald-50 to-green-50">
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="font-semibold text-right">Saldo Anterior</TableHead>
                    <TableHead className="font-semibold text-right">Saldo Atual</TableHead>
                    <TableHead className="w-20 text-center font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum crédito cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    creditos.map((credito) => (
                      <TableRow key={credito.id} className="hover:bg-emerald-50/50">
                        <TableCell className="font-medium">{credito.cliente}</TableCell>
                        <TableCell className="text-right">{formatCurrency(credito.saldoAnterior)}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(credito.saldoAtual)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCredito(credito)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCredito(credito.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </main>

      {/* Dialog para Gastos */}
      <Dialog open={showGastoForm} onOpenChange={setShowGastoForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGasto ? 'Editar Gasto' : 'Novo Gasto'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do gasto abaixo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gasto-data">Data</Label>
              <Input
                id="gasto-data"
                type="date"
                value={gastoForm.data}
                onChange={(e) => setGastoForm({ ...gastoForm, data: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gasto-descricao">Descrição</Label>
              <Input
                id="gasto-descricao"
                value={gastoForm.descricao}
                onChange={(e) => setGastoForm({ ...gastoForm, descricao: e.target.value })}
                placeholder="Descreva o gasto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gasto-valor">Valor (R$)</Label>
              <Input
                id="gasto-valor"
                type="number"
                step="0.01"
                value={gastoForm.valor}
                onChange={(e) => setGastoForm({ ...gastoForm, valor: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGastoForm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingGasto ? handleUpdateGasto : handleAddGasto}
              className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
            >
              {editingGasto ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Créditos */}
      <Dialog open={showCreditoForm} onOpenChange={setShowCreditoForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCredito ? 'Editar Crédito' : 'Novo Crédito'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do crédito do cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credito-cliente">Cliente</Label>
              <Input
                id="credito-cliente"
                value={creditoForm.cliente}
                onChange={(e) => setCreditoForm({ ...creditoForm, cliente: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credito-saldo-anterior">Saldo Anterior (R$)</Label>
              <Input
                id="credito-saldo-anterior"
                type="number"
                step="0.01"
                value={creditoForm.saldoAnterior}
                onChange={(e) => setCreditoForm({ ...creditoForm, saldoAnterior: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credito-saldo-atual">Saldo Atual (R$)</Label>
              <Input
                id="credito-saldo-atual"
                type="number"
                step="0.01"
                value={creditoForm.saldoAtual}
                onChange={(e) => setCreditoForm({ ...creditoForm, saldoAtual: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditoForm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingCredito ? handleUpdateCredito : handleAddCredito}
              className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
            >
              {editingCredito ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
