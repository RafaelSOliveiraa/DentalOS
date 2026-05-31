/**
 * Centralised Supabase query functions used by React Query hooks.
 * Each function calls getSupabase() lazily — createClient() is never
 * executed at module-import time, preventing Vercel prerender errors.
 */
import { getSupabase } from "./supabase";
import type {
  DentistaRow,
  PacienteRow,
  AgendamentoRow,
  AnamneseRow,
  ConsultaRow,
  EstoqueMovRow,
  FinanceiroPacienteRow,
  ParcelaRow,
} from "./supabase";

/* ─── Dentistas ─── */
export async function fetchDentistas(): Promise<DentistaRow[]> {
  const { data, error } = await getSupabase()
    .from("dentistas")
    .select("*")
    .order("nome");
  if (error) throw error;
  return data ?? [];
}

export async function createDentista(
  payload: Omit<DentistaRow, "id" | "created_at" | "updated_at">
): Promise<DentistaRow> {
  const { data, error } = await getSupabase()
    .from("dentistas")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDentista(
  id: string,
  payload: Partial<Omit<DentistaRow, "id" | "created_at">>
): Promise<DentistaRow> {
  const { data, error } = await getSupabase()
    .from("dentistas")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Pacientes ─── */
export async function fetchPacientes(search = ""): Promise<PacienteRow[]> {
  let q = getSupabase()
    .from("pacientes")
    .select("*")
    .order("nome");

  if (search.trim()) {
    q = q.or(
      `nome.ilike.%${search}%,telefone.ilike.%${search}%,tratamento.ilike.%${search}%`
    );
  }
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

/** Only the columns that actually exist in the pacientes table on Supabase. */
export type CreatePacientePayload = {
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  sexo: string;
  como_conheceu: string | null;
  dentista_responsavel: string | null;
  status: string;
  tratamento: string | null;
};

export async function createPaciente(
  payload: CreatePacientePayload
): Promise<PacienteRow> {
  const { data, error } = await getSupabase()
    .from("pacientes")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchPacienteById(id: string): Promise<PacienteRow> {
  const { data, error } = await getSupabase()
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updatePaciente(
  id: string,
  payload: Partial<Omit<PacienteRow, "id" | "created_at">>
): Promise<PacienteRow> {
  const { data, error } = await getSupabase()
    .from("pacientes")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Agendamentos ─── */
export async function fetchAgendamentosByDate(
  date: string
): Promise<AgendamentoRow[]> {
  const { data, error } = await getSupabase()
    .from("agendamentos")
    .select("*")
    .eq("data", date)
    .order("hora");
  if (error) throw error;
  return data ?? [];
}

export async function createAgendamento(
  payload: Omit<AgendamentoRow, "id" | "criado_em" | "updated_at">
): Promise<AgendamentoRow> {
  const { data, error } = await getSupabase()
    .from("agendamentos")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAgendamento(
  id: string,
  payload: Partial<Omit<AgendamentoRow, "id" | "criado_em">>
): Promise<AgendamentoRow> {
  const { data, error } = await getSupabase()
    .from("agendamentos")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Anamnese ─── */
export async function fetchAnamnese(
  pacienteId: string
): Promise<AnamneseRow | null> {
  const { data, error } = await getSupabase()
    .from("anamneses")
    .select("*")
    .eq("paciente_id", pacienteId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertAnamnese(
  payload: Omit<AnamneseRow, "id" | "updated_at">
): Promise<AnamneseRow> {
  const { data, error } = await getSupabase()
    .from("anamneses")
    .upsert({ ...payload, updated_at: new Date().toISOString() }, {
      onConflict: "paciente_id",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Consultas (histórico clínico) ─── */
export async function fetchConsultas(
  pacienteId: string
): Promise<ConsultaRow[]> {
  const { data, error } = await getSupabase()
    .from("consultas")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("data_consulta", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createConsulta(
  payload: Omit<ConsultaRow, "id" | "created_at">
): Promise<ConsultaRow> {
  const { data, error } = await getSupabase()
    .from("consultas")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Financeiro Paciente ─── */
export async function fetchFinanceiroPaciente(
  pacienteId: string
): Promise<FinanceiroPacienteRow[]> {
  const { data, error } = await getSupabase()
    .from("financeiro_paciente")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createFinanceiroPaciente(
  payload: Omit<FinanceiroPacienteRow, "id" | "created_at">
): Promise<FinanceiroPacienteRow> {
  const { data, error } = await getSupabase()
    .from("financeiro_paciente")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Parcelas ─── */
export async function fetchParcelas(
  pacienteId: string
): Promise<ParcelaRow[]> {
  const { data, error } = await getSupabase()
    .from("parcelas")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("vencimento", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createParcelas(
  payload: Omit<ParcelaRow, "id" | "created_at">[]
): Promise<ParcelaRow[]> {
  const { data, error } = await getSupabase()
    .from("parcelas")
    .insert(payload)
    .select();
  if (error) throw error;
  return data ?? [];
}

export async function updateParcela(
  id: string,
  payload: Partial<Omit<ParcelaRow, "id" | "created_at">>
): Promise<ParcelaRow> {
  const { data, error } = await getSupabase()
    .from("parcelas")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Agendamentos — semana ─── */
/** Fetches appointments for a range of dates [startDate, endDate] inclusive. */
export async function fetchAgendamentosByWeek(
  startDate: string,
  endDate: string
): Promise<AgendamentoRow[]> {
  const { data, error } = await getSupabase()
    .from("agendamentos")
    .select("*")
    .gte("data", startDate)
    .lte("data", endDate)
    .order("data")
    .order("hora");
  if (error) throw error;
  return data ?? [];
}

/* ─── Estoque — Movimentações ─── */
export type CreateEstoqueMovPayload = {
  tipo: "ENTRADA" | "SAÍDA" | "AJUSTE";
  item_nome: string;
  quantidade: number;
  custo_unitario: number | null;
  motivo: string | null;
  data: string;
  usuario: string | null;
};

export async function fetchEstoqueMovimentacoes(): Promise<EstoqueMovRow[]> {
  const { data, error } = await getSupabase()
    .from("estoque_movimentacoes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function createEstoqueMov(
  payload: CreateEstoqueMovPayload
): Promise<EstoqueMovRow> {
  const { data, error } = await getSupabase()
    .from("estoque_movimentacoes")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
