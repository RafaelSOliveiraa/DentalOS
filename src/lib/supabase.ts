/* ─── Lazy Supabase singleton ────────────────────────────────────────────────
   createClient() is NOT called at module import time.
   It is invoked only on the first getSupabase() call, which happens inside
   React Query queryFn callbacks — never during Next.js static prerendering.
   This prevents "supabaseUrl is required" / "Invalid supabaseUrl" errors on
   Vercel when env vars are absent or empty at build time.
──────────────────────────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null;

export function getSupabase() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    throw new Error(
      "Supabase env vars not set. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables."
    );
  }

  // Dynamic require keeps the supabase-js module out of the module-init
  // critical path — the bundler resolves it at build time, but the
  // Node/browser module is only loaded when this function is first called.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  _client = createClient(url, key);
  return _client;
}

/* ─── Table row types ────────────────────────────────────────────────────── */

export interface DentistaRow {
  id: string;
  nome: string;
  crm: string | null;
  especialidade: string | null;
  email: string | null;
  telefone: string | null;
  cor: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PacienteRow {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  sexo: string;
  endereco_rua: string | null;
  endereco_bairro: string | null;
  endereco_cidade: string | null;
  endereco_estado: string | null;
  endereco_cep: string | null;
  como_conheceu: string | null;
  dentista_responsavel: string | null; // real column name (was dentista_id)
  status: string;
  tratamento: string | null;
  // balance removed — column does not exist in the table
  created_at: string;
  updated_at: string;
}

export interface AgendamentoRow {
  id: string;
  data: string;
  hora: string;               // era hora_inicio — coluna real na tabela
  hora_fim: string | null;
  data_hora: string;
  duracao_minutos: number | null;
  procedimento: string | null;
  tipo_procedimento: string | null;
  status: string;
  confirmado: boolean;        // era status === "confirmado"
  observacoes: string | null;
  paciente_id: string | null;
  paciente_nome: string | null; // desnormalizado — sem join
  dentista_nome: string | null; // desnormalizado — sem join
  novo_paciente: boolean;     // era is_novo_paciente
  cor: string | null;
  criado_em: string;          // era created_at
  updated_at: string;
}

export interface AnamneseRow {
  id: string;
  paciente_id: string;
  pressao_arterial: string | null;
  diabetico: boolean;
  cardiopatia: boolean;
  hipertensao: boolean;
  fumante: boolean;
  gravida: boolean;
  alergias: string | null;
  medicamentos: string | null;
  cirurgias: string | null;
  observacoes: string | null;
  assinatura: string | null;
  termo_aceito: boolean | null;
  data_assinatura: string | null;
  updated_at: string;
}

export interface ConsultaRow {
  id: string;
  paciente_id: string;
  dentista_nome: string | null;
  data_consulta: string;
  tipo_consulta: string | null;
  queixa_principal: string | null;
  exame_clinico: string | null;
  diagnostico: string | null;
  tratamento_realizado: string | null;
  prescricao: string | null;
  proximo_passo: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface FinanceiroPacienteRow {
  id: string;
  paciente_id: string;
  descricao: string;
  valor_total: number;
  num_parcelas: number;
  data_primeira_parcela: string;
  valor_pago: number;
  created_at: string;
}

export interface ParcelaRow {
  id: string;
  financeiro_paciente_id: string;
  paciente_id: string;
  num_parcela: number;
  valor: number;
  vencimento: string;
  status: "pendente" | "pago" | "atraso";
  data_pagamento: string | null;
  forma_pagamento: string | null;
  valor_pago: number | null;
  created_at: string;
}

/* ─── Estoque ─── */
export interface EstoqueMovRow {
  id: string;
  tipo: "ENTRADA" | "SAÍDA" | "AJUSTE";
  item_nome: string;
  quantidade: number;
  custo_unitario: number | null;
  motivo: string | null;
  data: string;
  usuario: string | null;
  created_at: string;
}
