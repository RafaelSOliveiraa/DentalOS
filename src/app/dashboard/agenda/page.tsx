"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, Phone, User,
  UserCheck, CalendarCheck, CalendarX, Calendar,
  AlertCircle, CheckCircle2, LoaderCircle,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  fetchDentistas,
  fetchAgendamentosByDate,
  createAgendamento,
  fetchPacientes,
} from "@/lib/queries";
import type { DentistaRow, AgendamentoRow } from "@/lib/supabase";

/* ─── Types ─── */
type ProcedureType =
  | "Ortodontia"
  | "Implante"
  | "Consulta"
  | "Retorno"
  | "Clareamento"
  | "Intervalo"
  | "Urgência";

type DentistKey = "ana" | "bruno" | "carla";

interface Appointment {
  id: number;
  dentist: DentistKey;
  procedure: ProcedureType;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  patient: string;
  phone?: string;
  isNew?: boolean;    // NP badge
  confirmed: boolean;
  isBreak?: boolean;
}

/* ─── Grid constants ─── */
const PIXELS_PER_MIN = 2;
const START_HOUR = 7;
const END_HOUR = 20;
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MIN; // 1560px

function timeToY(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return ((h - START_HOUR) * 60 + m) * PIXELS_PER_MIN;
}

function timeDiffMin(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

/* ─── Procedure colors ─── */
const PROC_COLOR: Record<ProcedureType, string> = {
  Ortodontia:  "#7C3AED",
  Implante:    "#059669",
  Consulta:    "#2563EB",
  Retorno:     "#0891B2",
  Clareamento: "#CA8A04",
  Intervalo:   "#6B7280",
  Urgência:    "#DC2626",
};

/* ─── Dentists ─── */
const DENTISTS: { key: DentistKey; name: string; initials: string; color: string }[] = [
  { key: "ana",   name: "Dra. Ana Paula", initials: "AP", color: "#1D9E75" },
  { key: "bruno", name: "Dr. Bruno",      initials: "BR", color: "#9B6DFF" },
  { key: "carla", name: "Dra. Carla",     initials: "CA", color: "#5B8DEF" },
];

/* ─── Appointment data ─── */
const APPOINTMENTS: Appointment[] = [
  // Dra. Ana Paula
  { id: 1,  dentist: "ana",   procedure: "Ortodontia",  start: "08:00", end: "09:00", patient: "João Silva",     phone: "(11) 99999-0001", confirmed: true  },
  { id: 2,  dentist: "ana",   procedure: "Implante",    start: "09:00", end: "10:00", patient: "Maria Santos",   phone: "(11) 99999-0002", isNew: true, confirmed: false },
  { id: 3,  dentist: "ana",   procedure: "Implante",    start: "10:00", end: "11:30", patient: "Carlos Mota",    phone: "(11) 99999-0003", confirmed: true  },
  { id: 4,  dentist: "ana",   procedure: "Intervalo",   start: "11:30", end: "12:00", patient: "Intervalo",      confirmed: true, isBreak: true },
  { id: 5,  dentist: "ana",   procedure: "Clareamento", start: "13:00", end: "14:00", patient: "Ana Ferreira",   phone: "(11) 99999-0005", confirmed: true  },
  { id: 6,  dentist: "ana",   procedure: "Consulta",    start: "14:00", end: "15:00", patient: "Pedro Lima",     phone: "(11) 99999-0006", isNew: true, confirmed: true  },
  { id: 7,  dentist: "ana",   procedure: "Ortodontia",  start: "15:00", end: "16:00", patient: "Lucia Rocha",    phone: "(11) 99999-0007", confirmed: true  },
  { id: 8,  dentist: "ana",   procedure: "Retorno",     start: "16:00", end: "17:00", patient: "Roberto Costa",  phone: "(11) 99999-0008", confirmed: false },
  // Dr. Bruno
  { id: 9,  dentist: "bruno", procedure: "Consulta",    start: "08:00", end: "09:00", patient: "Fernanda Lima",  phone: "(11) 99999-0009", isNew: true, confirmed: true  },
  { id: 10, dentist: "bruno", procedure: "Ortodontia",  start: "09:00", end: "10:30", patient: "Marcos Souza",   phone: "(11) 99999-0010", confirmed: true  },
  { id: 11, dentist: "bruno", procedure: "Ortodontia",  start: "10:30", end: "11:30", patient: "Patricia Dias",  phone: "(11) 99999-0011", confirmed: true  },
  { id: 12, dentist: "bruno", procedure: "Retorno",     start: "13:00", end: "14:00", patient: "Bruno Alves",    phone: "(11) 99999-0012", confirmed: true  },
  { id: 13, dentist: "bruno", procedure: "Implante",    start: "14:00", end: "15:30", patient: "Camila Torres",  phone: "(11) 99999-0013", isNew: true, confirmed: false },
  { id: 14, dentist: "bruno", procedure: "Consulta",    start: "16:00", end: "17:00", patient: "Diego Martins",  phone: "(11) 99999-0014", confirmed: true  },
  // Dra. Carla
  { id: 15, dentist: "carla", procedure: "Clareamento", start: "08:00", end: "09:00", patient: "Juliana Neves",  phone: "(11) 99999-0015", confirmed: true  },
  { id: 16, dentist: "carla", procedure: "Consulta",    start: "09:00", end: "10:00", patient: "Ricardo Faria",  phone: "(11) 99999-0016", isNew: true, confirmed: true  },
  { id: 17, dentist: "carla", procedure: "Retorno",     start: "10:00", end: "11:00", patient: "Sandra Lima",    phone: "(11) 99999-0017", confirmed: true  },
  { id: 18, dentist: "carla", procedure: "Ortodontia",  start: "13:00", end: "14:30", patient: "Paulo Mota",     phone: "(11) 99999-0018", confirmed: true  },
  { id: 19, dentist: "carla", procedure: "Urgência",    start: "15:00", end: "16:00", patient: "Paciente walk-in",                          confirmed: false },
];

/* ─── Current time hook ─── */
function useCurrentTimeY() {
  const [y, setY] = useState<number | null>(null);
  useEffect(() => {
    function calc() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h < START_HOUR || h >= END_HOUR) { setY(null); return; }
      setY(((h - START_HOUR) * 60 + m) * PIXELS_PER_MIN);
    }
    calc();
    const t = setInterval(calc, 60_000);
    return () => clearInterval(t);
  }, []);
  return y;
}

/* ─── Free slot builder ─── */
function buildFreeSlots(dentistKey: DentistKey): { start: string; end: string }[] {
  return buildFreeSlotsFromAppts(dentistKey, APPOINTMENTS);
}

function buildFreeSlotsFromAppts(dentistKey: DentistKey, apptList: Appointment[]): { start: string; end: string }[] {
  const appts = apptList
    .filter(a => a.dentist === dentistKey)
    .sort((a, b) => a.start.localeCompare(b.start));

  const dayStart = `${String(START_HOUR).padStart(2, "0")}:00`;
  const dayEnd   = `${String(END_HOUR).padStart(2, "0")}:00`;
  const slots: { start: string; end: string }[] = [];
  let cursor = dayStart;

  for (const appt of appts) {
    if (appt.start > cursor) slots.push({ start: cursor, end: appt.start });
    if (appt.end > cursor)   cursor = appt.end;
  }
  if (cursor < dayEnd) slots.push({ start: cursor, end: dayEnd });
  return slots;
}

/* ─── Dentist counters ─── */
function getDentistCounters(key: DentistKey, apptList: Appointment[] = APPOINTMENTS) {
  const real = apptList.filter(a => a.dentist === key && !a.isBreak);
  return {
    total:       real.length,
    confirmed:   real.filter(a =>  a.confirmed).length,
    unconfirmed: real.filter(a => !a.confirmed).length,
  };
}

const HOUR_LABELS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => i + START_HOUR
);

/* ─── Appointment block ─── */
function AppointmentBlock({
  appt,
  onClick,
}: {
  appt: Appointment;
  onClick: (a: Appointment) => void;
}) {
  const top    = timeToY(appt.start);
  const height = timeDiffMin(appt.start, appt.end) * PIXELS_PER_MIN;
  const color  = PROC_COLOR[appt.procedure];
  const isBreak = appt.isBreak;

  return (
    <div
      onClick={() => !isBreak && onClick(appt)}
      className={`absolute left-1 right-1 rounded-lg overflow-hidden select-none ${
        isBreak ? "cursor-default" : "cursor-pointer hover:brightness-110 transition-all"
      }`}
      style={{
        top,
        height: Math.max(height - 2, 22),
        background: isBreak ? "rgba(107,114,128,0.10)" : `${color}18`,
        border: `1px solid ${color}35`,
        borderLeft: `3px solid ${color}`,
        zIndex: 10,
      }}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-between">
        {isBreak ? (
          <span className="text-[10px] text-white/30">Intervalo</span>
        ) : (
          <>
            <div className="flex items-start gap-1">
              <span
                className="text-[11px] font-semibold leading-tight truncate"
                style={{ color }}
              >
                {appt.patient}
              </span>
              {appt.isNew && (
                <span
                  className="text-[9px] font-bold px-1 rounded flex-shrink-0"
                  style={{ background: "#EA580C20", color: "#EA580C" }}
                >
                  NP
                </span>
              )}
            </div>
            {height >= 48 && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/35 truncate">{appt.procedure}</span>
                {appt.confirmed ? (
                  <CheckCircle2 size={10} className="text-[#1D9E75] flex-shrink-0" />
                ) : (
                  <AlertCircle size={10} style={{ color: "#CA8A04" }} className="flex-shrink-0" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Free slot hover cell ─── */
function FreeSlot({
  dentist,
  start,
  end,
  onClick,
}: {
  dentist: DentistKey;
  start: string;
  end: string;
  onClick: (d: DentistKey, t: string) => void;
}) {
  const top    = timeToY(start);
  const height = timeDiffMin(start, end) * PIXELS_PER_MIN;
  if (height < 30) return null;
  return (
    <div
      className="absolute left-1 right-1 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
      style={{
        top,
        height: height - 2,
        border: "1px dashed rgba(255,255,255,0.07)",
        zIndex: 5,
      }}
      onClick={() => onClick(dentist, start)}
    >
      <Plus size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
    </div>
  );
}

/* ─── New Appointment Modal (with Supabase save + patient search) ─── */
function NewAppointmentModal({
  dentist,
  time,
  onClose,
  dbDentistas,
}: {
  dentist: DentistKey;
  time: string;
  onClose: () => void;
  dbDentistas: DentistaRow[];
}) {
  const qc = useQueryClient();
  const [selDentist, setSelDentist] = useState(dentist);
  const [selDate,    setSelDate]    = useState("2026-05-27");
  const [selTime,    setSelTime]    = useState(time);
  const [duration,   setDuration]   = useState("60");
  const [patSearch,  setPatSearch]  = useState("");
  const [selPatient, setSelPatient] = useState<{ id: string; nome: string } | null>(null);
  const [procedure,  setProcedure]  = useState<ProcedureType>("Consulta");
  const [status,     setStatus]     = useState<"confirmed" | "unconfirmed">("confirmed");
  const [notes,      setNotes]      = useState("");

  /* Patient search from Supabase */
  const { data: patients = [], isFetching: searchingPat } = useQuery({
    queryKey: ["pacientes-search", patSearch],
    queryFn:  () => fetchPacientes(patSearch),
    enabled:  patSearch.trim().length >= 2,
  });

  /* Save mutation */
  const saveMut = useMutation({
    mutationFn: () => {
      const dentistRecord = dbDentistas.find(d => {
        const key = d.nome.toLowerCase().includes("ana") ? "ana"
          : d.nome.toLowerCase().includes("bruno") ? "bruno"
          : "carla";
        return key === selDentist;
      }) ?? dbDentistas[0];

      const [h, m] = selTime.split(":").map(Number);
      const endMin  = h * 60 + m + Number(duration);
      const endH    = String(Math.floor(endMin / 60)).padStart(2, "0");
      const endM    = String(endMin % 60).padStart(2, "0");

      return createAgendamento({
        paciente_id:      selPatient?.id ?? null,
        dentista_id:      dentistRecord?.id ?? null,
        data:             selDate,
        hora_inicio:      selTime,
        hora_fim:         `${endH}:${endM}`,
        procedimento:     procedure,
        status:           status === "confirmed" ? "confirmado" : "nao_confirmado",
        observacoes:      notes || null,
        is_novo_paciente: false,
        is_break:         false,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agendamentos"] });
      toast.success("Agendamento salvo com sucesso!");
      onClose();
    },
    onError: (e: Error) => toast.error(`Erro ao agendar: ${e.message}`),
  });

  const procedures = (Object.keys(PROC_COLOR) as ProcedureType[]).filter(
    p => p !== "Intervalo"
  );
  const selectCls =
    "w-full px-3 py-2 rounded-lg text-sm text-white bg-[#1A1F35] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/40";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.08] overflow-hidden"
        style={{ background: "#131726" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(29,158,117,0.12)" }}>
              <CalendarCheck size={16} className="text-[#1D9E75]" />
            </div>
            <h2 className="text-white font-bold text-base">Novo Agendamento</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Dentist */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Dentista</label>
            <select value={selDentist} onChange={e => setSelDentist(e.target.value as DentistKey)} className={selectCls}>
              {DENTISTS.map(d => <option key={d.key} value={d.key}>{d.name}</option>)}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Data</label>
              <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)} className={selectCls} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Horário</label>
              <input type="time" value={selTime} onChange={e => setSelTime(e.target.value)} className={selectCls} />
            </div>
          </div>

          {/* Duration + Procedure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Duração</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className={selectCls}>
                {[30, 60, 90, 120].map(d => <option key={d} value={String(d)}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Procedimento</label>
              <select value={procedure} onChange={e => setProcedure(e.target.value as ProcedureType)} className={selectCls}>
                {procedures.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Patient search */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">
              Paciente {searchingPat && <LoaderCircle size={10} className="inline animate-spin ml-1" />}
            </label>
            {selPatient ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#1D9E75]/35" style={{ background: "rgba(29,158,117,0.08)" }}>
                <span className="text-sm text-white">{selPatient.nome}</span>
                <button onClick={() => { setSelPatient(null); setPatSearch(""); }} className="text-white/40 hover:text-white"><X size={12} /></button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={patSearch}
                  onChange={e => setPatSearch(e.target.value)}
                  placeholder="Buscar paciente pelo nome…"
                  className={`${selectCls} placeholder-white/20`}
                />
                {patients.length > 0 && patSearch.trim().length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/[0.08] overflow-hidden z-10 shadow-xl" style={{ background: "#1A1F35" }}>
                    {patients.slice(0, 6).map(p => (
                      <button key={p.id} onClick={() => { setSelPatient({ id: p.id, nome: p.nome }); setPatSearch(""); }}
                        className="w-full text-left px-3 py-2.5 text-sm text-white/80 hover:bg-white/[0.06] transition-colors flex items-center justify-between">
                        <span>{p.nome}</span>
                        <span className="text-xs text-white/30">{p.telefone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Status</label>
            <div className="flex gap-2">
              {([
                { v: "confirmed" as const,   label: "Confirmado",     activeColor: "#1D9E75", activeBg: "rgba(29,158,117,0.14)", activeBorder: "rgba(29,158,117,0.35)" },
                { v: "unconfirmed" as const, label: "Não confirmado", activeColor: "#CA8A04", activeBg: "rgba(202,138,4,0.11)",  activeBorder: "rgba(202,138,4,0.3)"  },
              ]).map(s => (
                <button key={s.v} onClick={() => setStatus(s.v)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all"
                  style={{ background: status === s.v ? s.activeBg : "transparent", borderColor: status === s.v ? s.activeBorder : "rgba(255,255,255,0.08)", color: status === s.v ? s.activeColor : "rgba(255,255,255,0.38)" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Observações</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Observações opcionais..."
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 bg-[#1A1F35] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/40 resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white/55 border border-white/[0.08] hover:border-white/[0.18] transition-all">
            Cancelar
          </button>
          <button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all hover:brightness-110"
            style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.22)" }}>
            {saveMut.isPending ? <LoaderCircle size={14} className="animate-spin" /> : <CalendarCheck size={14} />}
            Agendar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Appointment Detail Modal ─── */
function AppointmentDetailModal({
  appt,
  onClose,
}: {
  appt: Appointment;
  onClose: () => void;
}) {
  const color   = PROC_COLOR[appt.procedure];
  const dentist = DENTISTS.find(d => d.key === appt.dentist)!;

  const actions: {
    label: string;
    Icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
  }[] = [
    { label: "Confirmar", Icon: CheckCircle2, color: "#1D9E75", bg: "rgba(29,158,117,0.12)",  border: "rgba(29,158,117,0.28)" },
    { label: "Cancelar",  Icon: CalendarX,    color: "#DC2626", bg: "rgba(220,38,38,0.09)",   border: "rgba(220,38,38,0.22)"  },
    { label: "Realizar",  Icon: CalendarCheck,color: "#5B8DEF", bg: "rgba(91,141,239,0.09)",  border: "rgba(91,141,239,0.22)" },
    { label: "Falta",     Icon: UserCheck,    color: "#CA8A04", bg: "rgba(202,138,4,0.09)",   border: "rgba(202,138,4,0.22)"  },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/[0.08] overflow-hidden"
        style={{ background: "#131726" }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-white/[0.06]"
          style={{ borderLeft: `4px solid ${color}` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: `${color}20`, color }}
                >
                  {appt.procedure}
                </span>
                {appt.isNew && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: "#EA580C20", color: "#EA580C" }}
                  >
                    Novo Paciente
                  </span>
                )}
                {appt.confirmed ? (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: "rgba(29,158,117,0.13)", color: "#1D9E75" }}
                  >
                    ✓ Confirmado
                  </span>
                ) : (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: "rgba(202,138,4,0.11)", color: "#CA8A04" }}
                  >
                    ⚠ Aguardando
                  </span>
                )}
              </div>
              <h2 className="text-white font-bold text-lg leading-tight truncate">
                {appt.patient}
              </h2>
              <p className="text-white/40 text-sm mt-0.5">
                {appt.start} – {appt.end} · {dentist.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Info rows */}
        <div className="px-6 py-4 space-y-3">
          {appt.phone && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <Phone size={14} className="text-white/35" />
              </div>
              <div>
                <p className="text-xs text-white/30">Telefone</p>
                <p className="text-sm text-white">{appt.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Clock size={14} className="text-white/35" />
            </div>
            <div>
              <p className="text-xs text-white/30">Duração</p>
              <p className="text-sm text-white">
                {timeDiffMin(appt.start, appt.end)} min · {appt.start} – {appt.end}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <User size={14} className="text-white/35" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${dentist.color}20`, color: dentist.color }}
              >
                {dentist.initials}
              </span>
              <p className="text-sm text-white">{dentist.name}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-5 grid grid-cols-2 gap-2">
          {actions.map(({ label, Icon, color: c, bg, border }) => (
            <button
              key={label}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:brightness-110"
              style={{ background: bg, borderColor: border, color: c }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AgendaPage() {
  const [selectedAppt,   setSelectedAppt]   = useState<Appointment | null>(null);
  const [newApptDentist, setNewApptDentist] = useState<DentistKey | null>(null);
  const [newApptTime,    setNewApptTime]    = useState("09:00");
  const [view,           setView]           = useState<"dia" | "semana">("dia");
  const TODAY = "2026-05-27";

  const timelineRef  = useRef<HTMLDivElement>(null);
  const currentTimeY = useCurrentTimeY();

  /* ── Supabase queries ── */
  const { data: dbDentistas = [] } = useQuery({
    queryKey: ["dentistas"],
    queryFn:  fetchDentistas,
  });

  const { data: dbAgendamentos = [], isLoading: loadingAppts } = useQuery({
    queryKey: ["agendamentos", TODAY],
    queryFn:  () => fetchAgendamentosByDate(TODAY),
  });

  /* Map DB agendamentos → local Appointment shape (overlay on static) */
  const liveAppts: Appointment[] = dbAgendamentos.map(a => {
    const dentKey: DentistKey =
      (a.dentistas?.nome ?? "").toLowerCase().includes("ana") ? "ana"
      : (a.dentistas?.nome ?? "").toLowerCase().includes("bruno") ? "bruno"
      : "carla";
    return {
      id:        Number(a.id.replace(/-/g, "").slice(0, 8) || 0),
      dentist:   dentKey,
      procedure: (a.procedimento ?? "Consulta") as ProcedureType,
      start:     a.hora_inicio.slice(0, 5),
      end:       a.hora_fim.slice(0, 5),
      patient:   a.pacientes?.nome ?? "Paciente",
      phone:     a.pacientes?.telefone ?? undefined,
      confirmed: a.status === "confirmado",
      isBreak:   a.is_break,
    };
  });

  /* Use live data if available, else fall back to static demo data */
  const displayAppts = liveAppts.length > 0 ? liveAppts : APPOINTMENTS;

  // Scroll to 08:00 on first render
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timeToY("08:00") - 32;
    }
  }, []);

  function openNewAppt(dentist: DentistKey, time: string) {
    setNewApptDentist(dentist);
    setNewApptTime(time);
  }

  const totalReal      = displayAppts.filter(a => !a.isBreak).length;
  const totalConfirmed = displayAppts.filter(a => !a.isBreak && a.confirmed).length;

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />

      <main className="flex-1 ml-16 flex flex-col min-h-screen overflow-hidden">

        {/* ── Topbar ── */}
        <div
          className="flex-none border-b border-white/[0.06] px-6 py-3 flex items-center justify-between gap-4"
          style={{ background: "rgba(12,15,26,0.98)" }}
        >
          {/* Left: icon + date nav */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(29,158,117,0.12)" }}
            >
              <Calendar size={18} className="text-[#1D9E75]" />
            </div>

            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all">
                <ChevronLeft size={16} />
              </button>

              <div className="px-1">
                <h1 className="text-white font-bold text-base leading-tight">
                  Terça, 27 de maio de 2026
                </h1>
                <p className="text-white/40 text-xs">
                  {totalReal} consultas · {totalConfirmed} confirmadas
                </p>
              </div>

              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all">
                <ChevronRight size={16} />
              </button>
            </div>

            <button className="px-3 py-1 rounded-lg text-xs font-semibold border border-white/[0.10] text-white/55 hover:text-white hover:border-white/20 transition-all">
              Hoje
            </button>
          </div>

          {/* Right: toggle + new button */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center rounded-lg border border-white/[0.08] overflow-hidden"
              style={{ background: "#131726" }}
            >
              {(["dia", "semana"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-4 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: view === v ? "rgba(29,158,117,0.14)" : "transparent",
                    color:      view === v ? "#1D9E75"               : "rgba(255,255,255,0.38)",
                  }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => openNewAppt("ana", "09:00")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 flex-shrink-0"
              style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.22)" }}
            >
              <Plus size={16} />
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* ── Color legend ── */}
        <div
          className="flex-none px-6 py-2 border-b border-white/[0.04] flex items-center gap-4 flex-wrap"
          style={{ background: "rgba(12,15,26,0.95)" }}
        >
          {(Object.entries(PROC_COLOR) as [ProcedureType, string][]).map(([proc, clr]) => (
            <div key={proc} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: clr }} />
              <span className="text-xs text-white/38">{proc}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-1">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: "#EA580C1A", color: "#EA580C" }}
            >
              NP
            </span>
            <span className="text-xs text-white/38">Novo paciente</span>
          </div>
        </div>

        {/* ── Grid area ── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">

          {/* Dentist column headers */}
          <div
            className="flex-none flex border-b border-white/[0.06]"
            style={{ background: "rgba(12,15,26,0.95)", paddingLeft: 64 }}
          >
            {DENTISTS.map(d => {
              const c = getDentistCounters(d.key, displayAppts);
              return (
                <div
                  key={d.key}
                  className="flex-1 px-4 py-3 flex items-center gap-3 border-r border-white/[0.04] last:border-r-0"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      background: `${d.color}1A`,
                      color:       d.color,
                      border:      `1.5px solid ${d.color}40`,
                    }}
                  >
                    {d.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight truncate">
                      {d.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/35">{c.total} total</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: "rgba(29,158,117,0.12)", color: "#1D9E75" }}
                      >
                        {c.confirmed} ✓
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: "rgba(202,138,4,0.10)", color: "#CA8A04" }}
                      >
                        {c.unconfirmed} ⚠
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scrollable timeline */}
          <div ref={timelineRef} className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex" style={{ height: TOTAL_HEIGHT }}>

              {/* Hour labels column */}
              <div className="flex-none w-16 relative" style={{ height: TOTAL_HEIGHT }}>
                {HOUR_LABELS.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 flex items-start justify-end pr-3"
                    style={{
                      top:    (h - START_HOUR) * 60 * PIXELS_PER_MIN - 8,
                      height: 60 * PIXELS_PER_MIN,
                    }}
                  >
                    <span className="text-[10px] text-white/22 font-medium tabular-nums">
                      {String(h).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Dentist columns */}
              <div
                className="flex-1 flex border-l border-white/[0.04]"
                style={{ height: TOTAL_HEIGHT }}
              >
                {DENTISTS.map((d, di) => {
                  const colAppts   = displayAppts.filter(a => a.dentist === d.key);
                  const freeSlots  = buildFreeSlotsFromAppts(d.key, displayAppts);

                  return (
                    <div
                      key={d.key}
                      className="flex-1 relative border-r border-white/[0.04] last:border-r-0"
                      style={{ height: TOTAL_HEIGHT }}
                    >
                      {/* Hour grid lines */}
                      {HOUR_LABELS.map(h => (
                        <div
                          key={h}
                          className="absolute left-0 right-0 border-t"
                          style={{
                            top:         (h - START_HOUR) * 60 * PIXELS_PER_MIN,
                            borderColor: "rgba(255,255,255,0.04)",
                          }}
                        />
                      ))}

                      {/* Half-hour dashed lines */}
                      {HOUR_LABELS.slice(0, -1).map(h => (
                        <div
                          key={`${h}-half`}
                          className="absolute left-0 right-0 border-t border-dashed"
                          style={{
                            top:         (h - START_HOUR) * 60 * PIXELS_PER_MIN + 60,
                            borderColor: "rgba(255,255,255,0.025)",
                          }}
                        />
                      ))}

                      {/* Current time red line */}
                      {currentTimeY !== null && di === 0 && (
                        <div
                          className="absolute z-20 flex items-center"
                          style={{ top: currentTimeY, left: -4, right: 0 }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: "#DC2626" }}
                          />
                          <div className="flex-1 h-px" style={{ background: "#DC2626" }} />
                        </div>
                      )}
                      {currentTimeY !== null && di > 0 && (
                        <div
                          className="absolute left-0 right-0 z-20 h-px"
                          style={{ top: currentTimeY, background: "#DC2626" }}
                        />
                      )}

                      {/* Free slots */}
                      {freeSlots.map((slot, si) => (
                        <FreeSlot
                          key={si}
                          dentist={d.key}
                          start={slot.start}
                          end={slot.end}
                          onClick={openNewAppt}
                        />
                      ))}

                      {/* Appointments */}
                      {colAppts.map(appt => (
                        <AppointmentBlock
                          key={appt.id}
                          appt={appt}
                          onClick={setSelectedAppt}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Modals ── */}
      {selectedAppt && (
        <AppointmentDetailModal
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      )}
      {newApptDentist && (
        <NewAppointmentModal
          dentist={newApptDentist}
          time={newApptTime}
          onClose={() => setNewApptDentist(null)}
          dbDentistas={dbDentistas}
        />
      )}
    </div>
  );
}
