import { createClient, SupabaseClient } from "@supabase/supabase-js";

/* ─── Lazy singleton ─────────────────────────────────────────────────────────
   createClient() NOT called at import time — only the first time getSupabase()
   is invoked inside a React Query queryFn (client-side, after hydration).
   This prevents Vercel from throwing "supabaseUrl is required" / "Invalid
   supabaseUrl" during static prerendering when env vars are absent or empty.
──────────────────────────────────────────────────────────────────────────── */
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Add them in Vercel → Settings → Environment Variables."
    );
  }
  _client = createClient(url, key);
  return _client;
}

/* ─── Table types ─── */

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
  dentista_id: string | null;
  status: string;
  tratamento: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface AgendamentoRow {
  id: string;
  paciente_id: string | null;
  dentista_id: string | null;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  procedimento: string | null;
  status: string;
  observacoes: string | null;
  is_novo_paciente: boolean;
  is_break: boolean;
  pacientes?: { nome: string; telefone: string | null } | null;
  dentistas?: { nome: string; cor: string } | null;
  created_at: string;
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
  updated_at: string;
}

export interface ConsultaRow {
  id: string;
  paciente_id: string;
  dentista_id: string | null;
  data: string;
  queixa: string | null;
  exame_clinico: string | null;
  diagnostico: string | null;
  tratamento_realizado: string | null;
  prescricao: string | null;
  proximo_passo: string | null;
  observacoes: string | null;
  procedimento: string | null;
  proc_color: string | null;
  created_at: string;
  dentistas?: { nome: string } | null;
}
