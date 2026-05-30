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

export async function createPaciente(
  payload: Omit<PacienteRow, "id" | "created_at" | "updated_at">
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
    .select(`*, pacientes(nome, telefone), dentistas(nome, cor)`)
    .eq("data", date)
    .order("hora_inicio");
  if (error) throw error;
  return data ?? [];
}

export async function createAgendamento(
  payload: Omit<AgendamentoRow, "id" | "created_at" | "pacientes" | "dentistas">
): Promise<AgendamentoRow> {
  const { data, error } = await getSupabase()
    .from("agendamentos")
    .insert(payload)
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
    .select(`*, dentistas(nome)`)
    .eq("paciente_id", pacienteId)
    .order("data", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createConsulta(
  payload: Omit<ConsultaRow, "id" | "created_at" | "dentistas">
): Promise<ConsultaRow> {
  const { data, error } = await getSupabase()
    .from("consultas")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
