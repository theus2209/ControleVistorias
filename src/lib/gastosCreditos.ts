import { Gasto, GastoFormData, Credito, CreditoFormData } from '@/types';
import { supabase } from '@/lib/supabase';

export const gastosCreditosService = {
  // Gastos
  getGastos: async (): Promise<Gasto[]> => {
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .order('data', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(row => ({
      id: row.id,
      data: row.data,
      descricao: row.descricao,
      valor: parseFloat(row.valor),
      createdAt: row.created_at,
    }));
  },

  addGasto: async (formData: GastoFormData): Promise<Gasto> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('gastos')
      .insert({
        data: formData.data,
        descricao: formData.descricao,
        valor: formData.valor,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;

    return {
      id: data.id,
      data: data.data,
      descricao: data.descricao,
      valor: parseFloat(data.valor),
      createdAt: data.created_at,
    };
  },

  updateGasto: async (id: string, formData: Partial<GastoFormData>): Promise<Gasto | null> => {
    const { data, error } = await supabase
      .from('gastos')
      .update(formData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      data: data.data,
      descricao: data.descricao,
      valor: parseFloat(data.valor),
      createdAt: data.created_at,
    };
  },

  deleteGasto: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Créditos
  getCreditos: async (): Promise<Credito[]> => {
    const { data, error } = await supabase
      .from('creditos')
      .select('*')
      .order('cliente', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(row => ({
      id: row.id,
      cliente: row.cliente,
      saldoAnterior: parseFloat(row.saldo_anterior),
      saldoAtual: parseFloat(row.saldo_atual),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  addCredito: async (formData: CreditoFormData): Promise<Credito> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('creditos')
      .insert({
        cliente: formData.cliente,
        saldo_anterior: formData.saldoAnterior,
        saldo_atual: formData.saldoAtual,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;

    return {
      id: data.id,
      cliente: data.cliente,
      saldoAnterior: parseFloat(data.saldo_anterior),
      saldoAtual: parseFloat(data.saldo_atual),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  updateCredito: async (id: string, formData: Partial<CreditoFormData>): Promise<Credito | null> => {
    const updateData: any = {};
    if (formData.cliente !== undefined) updateData.cliente = formData.cliente;
    if (formData.saldoAnterior !== undefined) updateData.saldo_anterior = formData.saldoAnterior;
    if (formData.saldoAtual !== undefined) updateData.saldo_atual = formData.saldoAtual;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('creditos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      cliente: data.cliente,
      saldoAnterior: parseFloat(data.saldo_anterior),
      saldoAtual: parseFloat(data.saldo_atual),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  deleteCredito: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('creditos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};
