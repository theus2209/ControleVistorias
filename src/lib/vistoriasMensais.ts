import { supabase } from '@/lib/supabase';

export interface VistoriaMensal {
  id: string;
  mes: number;
  ano: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface VistoriaMensalFormData {
  mes: number;
  ano: number;
  total: number;
}

const DADOS_INICIAIS: VistoriaMensalFormData[] = [
  { mes: 3, ano: 2025, total: 160 },
  { mes: 4, ano: 2025, total: 136 },
  { mes: 5, ano: 2025, total: 158 },
  { mes: 6, ano: 2025, total: 175 },
  { mes: 7, ano: 2025, total: 196 },
  { mes: 8, ano: 2025, total: 208 },
  { mes: 9, ano: 2025, total: 207 },
  { mes: 10, ano: 2025, total: 237 },
  { mes: 11, ano: 2025, total: 175 },
  { mes: 12, ano: 2025, total: 167 },
  { mes: 1, ano: 2026, total: 132 },
  { mes: 2, ano: 2026, total: 146 },
  { mes: 3, ano: 2026, total: 161 },
  { mes: 4, ano: 2026, total: 144 },
];

export const vistoriasMensaisService = {
  getAll: async (): Promise<VistoriaMensal[]> => {
    const { data, error } = await supabase
      .from('vistorias_mensais')
      .select('*')
      .order('ano', { ascending: true })
      .order('mes', { ascending: true });

    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      mes: row.mes,
      ano: row.ano,
      total: row.total,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  seedDadosIniciais: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const inserts = DADOS_INICIAIS.map(d => ({
      user_id: user.id,
      mes: d.mes,
      ano: d.ano,
      total: d.total,
    }));

    const { error } = await supabase
      .from('vistorias_mensais')
      .upsert(inserts, { onConflict: 'user_id,mes,ano', ignoreDuplicates: true });

    if (error) throw error;
  },

  add: async (formData: VistoriaMensalFormData): Promise<VistoriaMensal> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('vistorias_mensais')
      .insert({ ...formData, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      mes: data.mes,
      ano: data.ano,
      total: data.total,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  update: async (id: string, formData: Partial<VistoriaMensalFormData>): Promise<VistoriaMensal | null> => {
    const { data, error } = await supabase
      .from('vistorias_mensais')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      mes: data.mes,
      ano: data.ano,
      total: data.total,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('vistorias_mensais')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};
