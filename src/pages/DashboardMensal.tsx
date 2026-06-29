import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VistoriaMensal, VistoriaMensalFormData, vistoriasMensaisService } from '@/lib/vistoriasMensais';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Edit, TrendingUp, BarChart2, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  LabelList,
} from 'recharts';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const ANOS = Array.from({ length: 6 }, (_, i) => 2024 + i);

export const DashboardMensal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [registros, setRegistros] = useState<VistoriaMensal[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VistoriaMensalFormData>({ mes: 1, ano: new Date().getFullYear(), total: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await vistoriasMensaisService.getAll();
      if (data.length === 0 && !seeded) {
        await vistoriasMensaisService.seedDadosIniciais();
        setSeeded(true);
        const seededData = await vistoriasMensaisService.getAll();
        setRegistros(seededData);
      } else {
        setRegistros(data);
      }
    } catch (error: any) {
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const chartData = registros.map(r => ({
    label: `${MESES[r.mes - 1].substring(0, 3)}/${String(r.ano).slice(-2)}`,
    total: r.total,
    id: r.id,
  }));

  const totalGeral = registros.reduce((sum, r) => sum + r.total, 0);
  const media = registros.length > 0 ? Math.round(totalGeral / registros.length) : 0;
  const maximo = registros.length > 0 ? Math.max(...registros.map(r => r.total)) : 0;
  const registroMaximo = registros.find(r => r.total === maximo);

  const handleAdd = async () => {
    try {
      const novo = await vistoriasMensaisService.add(formData);
      setRegistros(prev => [...prev, novo].sort((a, b) => a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes));
      setShowForm(false);
      setFormData({ mes: 1, ano: new Date().getFullYear(), total: 0 });
      toast({ title: 'Mês adicionado!', description: `${MESES[novo.mes - 1]}/${novo.ano} registrado com sucesso.` });
    } catch (error: any) {
      toast({ title: 'Erro ao adicionar', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (registro: VistoriaMensal) => {
    setEditingId(registro.id);
    setFormData({ mes: registro.mes, ano: registro.ano, total: registro.total });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const updated = await vistoriasMensaisService.update(editingId, formData);
      if (updated) {
        setRegistros(prev => prev.map(r => r.id === editingId ? updated : r));
        setEditingId(null);
        setShowForm(false);
        setFormData({ mes: 1, ano: new Date().getFullYear(), total: 0 });
        toast({ title: 'Atualizado!', description: 'Registro atualizado com sucesso.' });
      }
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await vistoriasMensaisService.delete(id);
      setRegistros(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Removido', description: 'Registro excluído com sucesso.', variant: 'destructive' });
    } catch (error: any) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-emerald-200 rounded-lg shadow-lg p-3">
          <p className="font-bold text-emerald-800">{label}</p>
          <p className="text-lg font-bold text-emerald-600">{payload[0].value} vistorias</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Dashboard Mensal</h1>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => { setEditingId(null); setFormData({ mes: 1, ano: new Date().getFullYear(), total: 0 }); setShowForm(true); }}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Mês
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Total de Meses</p>
                <p className="text-3xl font-bold">{registros.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Média Mensal</p>
                <p className="text-3xl font-bold">{media}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-400 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Recorde Mensal</p>
                <p className="text-3xl font-bold">{maximo}</p>
                {registroMaximo && (
                  <p className="text-xs text-white/70">{MESES[registroMaximo.mes - 1]}/{registroMaximo.ano}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Gráfico */}
        <Card className="p-6 bg-white shadow-lg border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-800 mb-4">Vistorias por Mês</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total" position="top" style={{ fontSize: 10, fill: '#065f46', fontWeight: 600 }} />
                </Bar>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Gráfico de Linha */}
        <Card className="p-6 bg-white shadow-lg border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-800 mb-4">Tendência de Vistorias</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ fill: '#059669', r: 4 }}
                activeDot={{ r: 6, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tabela */}
        <Card className="p-4 bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-lg">
          <h2 className="text-lg font-bold text-emerald-800 mb-4">Detalhamento por Mês</h2>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <TableHead className="font-semibold">Mês</TableHead>
                  <TableHead className="font-semibold">Ano</TableHead>
                  <TableHead className="font-semibold text-right">Total de Vistorias</TableHead>
                  <TableHead className="w-24 text-center font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                  </TableRow>
                ) : registros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado</TableCell>
                  </TableRow>
                ) : (
                  registros.map((registro) => (
                    <TableRow key={registro.id} className="hover:bg-emerald-50/50">
                      <TableCell className="font-medium">{MESES[registro.mes - 1]}</TableCell>
                      <TableCell>{registro.ano}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-emerald-700 text-lg">{registro.total}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(registro)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(registro.id)}
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
      </main>

      {/* Dialog de formulário */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingId(null); }}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Registro' : 'Novo Mês'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Atualize os dados do mês selecionado.' : 'Adicione um novo mês ao dashboard.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select
                value={String(formData.mes)}
                onValueChange={(val) => setFormData({ ...formData, mes: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ano</Label>
              <Select
                value={String(formData.ano)}
                onValueChange={(val) => setFormData({ ...formData, ano: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {ANOS.map(a => (
                    <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total de Vistorias</Label>
              <Input
                id="total"
                type="number"
                min={0}
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 150"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
              Cancelar
            </Button>
            <Button
              onClick={editingId ? handleUpdate : handleAdd}
              className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
            >
              {editingId ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
