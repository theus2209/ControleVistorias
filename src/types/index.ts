export interface Vistoria {
  id: string;
  numero: number;
  placaChassi: string;
  responsavel: string;
  cpf: string;
  dataVistoria: string;
  dataPagamento: string;
  tipoPagamento: 'Pix' | 'Dinheiro' | 'Pendente';
  proprietario: string;
  nomeNoPix: string;
  notaFiscal: boolean;
  createdAt: string;
}

export interface VistoriaFormData {
  placaChassi: string;
  responsavel: string;
  cpf: string;
  dataVistoria: string;
  dataPagamento: string;
  tipoPagamento: 'Pix' | 'Dinheiro' | 'Pendente';
  proprietario: string;
  nomeNoPix: string;
  notaFiscal: boolean;
}

export interface VistoriaStats {
  total: number;
  pagas: number;
  pix: number;
  dinheiro: number;
  pendentes: number;
  comNF: number;
}

export interface Gasto {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  createdAt: string;
}

export interface GastoFormData {
  data: string;
  descricao: string;
  valor: number;
}

export interface Credito {
  id: string;
  cliente: string;
  saldoAnterior: number;
  saldoAtual: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditoFormData {
  cliente: string;
  saldoAnterior: number;
  saldoAtual: number;
}
