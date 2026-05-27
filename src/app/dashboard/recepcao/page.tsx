"use client";

import { useState, useEffect } from "react";
import {
  Clock, Phone, User, Search, Bell,
  CheckCheck, CalendarCheck, Package, Cake,
  TriangleAlert, CircleCheck, ArrowRight,
  Calendar, UserCheck,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

/* ─── Types ─── */
type ProcedureType =
  | "Ortodontia" | "Implante" | "Consulta"
  | "Retorno"    | "Clareamento" | "Urgência";

type BalanceStatus = "atraso" | "pendente" | "quitado";

interface NextPatient {
  time: string;
  name: string;
  phone: string;
  procedure: ProcedureType;
  dentist: string;
  dentistInitials: string;
  dentistColor: string;
  isNew?: boolean;
  confirmed: boolean;
}

interface MiniAppt {
  start: string;
  end: string;
  patient: string;
  procedure: ProcedureType | "Intervalo";
  isNew?: boolean;
  isBreak?: boolean;
}

interface PatientBalance {
  name: string;
  phone: string;
  treatment: string;
  total: number;
  paid: number;
  remaining: number;
  status: BalanceStatus;
  nextInstallment: string;
  dueDate: string;
}

/* ─── Procedure colors ─── */
const PROC_COLOR: Record<string, string> = {
  Ortodontia:  "#7C3AED",
  Implante:    "#059669",
  Consulta:    "#2563EB",
  Retorno:     "#0891B2",
  Clareamento: "#CA8A04",
  Intervalo:   "#6B7280",
  Urgência:    "#DC2626",
};

/* ─── Status config ─── */
const STATUS_CFG: Record<BalanceStatus, { label: string; bg: string; border: string; color: string }> = {
  atraso:   { label: "Em atraso",  bg: "rgba(220,38,38,0.12)",   border: "rgba(220,38,38,0.28)",   color: "#DC2626" },
  pendente: { label: "Pendente",   bg: "rgba(202,138,4,0.11)",   border: "rgba(202,138,4,0.26)",   color: "#CA8A04" },
  quitado:  { label: "Quitado",    bg: "rgba(29,158,117,0.12)",  border: "rgba(29,158,117,0.28)",  color: "#1D9E75" },
};

/* ─── Static data ─── */
const NEXT_PATIENTS: NextPatient[] = [
  { time: "09:00", name: "Maria Santos",  phone: "(11) 99999-0002", procedure: "Implante",   dentist: "Dra. Ana Paula", dentistInitials: "AP", dentistColor: "#1D9E75", isNew: true,  confirmed: false },
  { time: "09:00", name: "Marcos Souza",  phone: "(11) 99999-0010", procedure: "Ortodontia", dentist: "Dr. Bruno",      dentistInitials: "BR", dentistColor: "#9B6DFF", confirmed: true  },
  { time: "09:00", name: "Ricardo Faria", phone: "(11) 99999-0016", procedure: "Consulta",   dentist: "Dra. Carla",     dentistInitials: "CA", dentistColor: "#5B8DEF", isNew: true,  confirmed: true  },
  { time: "10:00", name: "Carlos Mota",   phone: "(11) 99999-0003", procedure: "Implante",   dentist: "Dra. Ana Paula", dentistInitials: "AP", dentistColor: "#1D9E75", confirmed: true  },
  { time: "10:30", name: "João Silva",    phone: "(11) 99999-0001", procedure: "Ortodontia", dentist: "Dra. Ana Paula", dentistInitials: "AP", dentistColor: "#1D9E75", confirmed: true  },
];

const MINI_AGENDA: { dentist: string; initials: string; color: string; appts: MiniAppt[] }[] = [
  {
    dentist: "Dra. Ana Paula", initials: "AP", color: "#1D9E75",
    appts: [
      { start: "08:00", end: "09:00", patient: "João Silva",     procedure: "Ortodontia"  },
      { start: "09:00", end: "10:00", patient: "Maria Santos",   procedure: "Implante",   isNew: true },
      { start: "10:00", end: "11:30", patient: "Carlos Mota",    procedure: "Implante"    },
      { start: "11:30", end: "12:00", patient: "Intervalo",      procedure: "Intervalo",  isBreak: true },
      { start: "13:00", end: "14:00", patient: "Ana Ferreira",   procedure: "Clareamento" },
      { start: "14:00", end: "15:00", patient: "Pedro Lima",     procedure: "Consulta",   isNew: true },
      { start: "15:00", end: "16:00", patient: "Lucia Rocha",    procedure: "Ortodontia"  },
      { start: "16:00", end: "17:00", patient: "Roberto Costa",  procedure: "Retorno"     },
    ],
  },
  {
    dentist: "Dr. Bruno", initials: "BR", color: "#9B6DFF",
    appts: [
      { start: "08:00", end: "09:00", patient: "Fernanda Lima",  procedure: "Consulta",   isNew: true },
      { start: "09:00", end: "10:30", patient: "Marcos Souza",   procedure: "Ortodontia"  },
      { start: "10:30", end: "11:30", patient: "Patricia Dias",  procedure: "Ortodontia"  },
      { start: "13:00", end: "14:00", patient: "Bruno Alves",    procedure: "Retorno"     },
      { start: "14:00", end: "15:30", patient: "Camila Torres",  procedure: "Implante",   isNew: true },
      { start: "16:00", end: "17:00", patient: "Diego Martins",  procedure: "Consulta"    },
    ],
  },
  {
    dentist: "Dra. Carla", initials: "CA", color: "#5B8DEF",
    appts: [
      { start: "08:00", end: "09:00", patient: "Juliana Neves",    procedure: "Clareamento" },
      { start: "09:00", end: "10:00", patient: "Ricardo Faria",    procedure: "Consulta",  isNew: true },
      { start: "10:00", end: "11:00", patient: "Sandra Lima",      procedure: "Retorno"    },
      { start: "13:00", end: "14:30", patient: "Paulo Mota",       procedure: "Ortodontia" },
      { start: "15:00", end: "16:00", patient: "Paciente walk-in", procedure: "Urgência"   },
    ],
  },
];

const PATIENTS_BALANCE: PatientBalance[] = [
  { name: "João Silva",   phone: "(11) 99999-0001", treatment: "Ortodontia",  total: 4800, paid: 3000, remaining: 1800, status: "atraso",   nextInstallment: "R$ 600", dueDate: "15/05/2026" },
  { name: "Maria Lopes",  phone: "(11) 99999-0020", treatment: "Implante",    total: 3600, paid: 2620, remaining: 980,  status: "pendente", nextInstallment: "R$ 490", dueDate: "01/06/2026" },
  { name: "Carlos Mota",  phone: "(11) 99999-0003", treatment: "Implante",    total: 1800, paid: 1800, remaining: 0,    status: "quitado",  nextInstallment: "—",       dueDate: "—"          },
  { name: "Pedro Santos", phone: "(11) 99999-0030", treatment: "Ortodontia",  total: 7200, paid: 4800, remaining: 2400, status: "atraso",   nextInstallment: "R$ 800", dueDate: "10/05/2026" },
  { name: "Ana Ferreira", phone: "(11) 99999-0005", treatment: "Clareamento", total: 500,  paid: 250,  remaining: 250,  status: "pendente", nextInstallment: "R$ 250", dueDate: "30/06/2026" },
];

const UNCONFIRMED_ALERTS = [
  { name: "Maria Santos",  time: "09:00", phone: "(11) 99999-0002" },
  { name: "Roberto Costa", time: "16:00", phone: "(11) 99999-0008" },
  { name: "Camila Torres", time: "14:00", phone: "(11) 99999-0013" },
];

const OPEN_SLOTS = [
  { dentist: "Dra. Ana Paula", initials: "AP", color: "#1D9E75", slot: "12:00 – 13:00", duration: "1h" },
  { dentist: "Dr. Bruno",      initials: "BR", color: "#9B6DFF", slot: "11:30 – 13:00", duration: "1h30" },
  { dentist: "Dra. Carla",     initials: "CA", color: "#5B8DEF", slot: "11:00 – 13:00", duration: "2h" },
];

const CRITICAL_STOCK = ["Resina Composta A2", "Anestésico Lidocaína", "Luvas P"];

/* ─── Real-time clock ─── */
function useRealTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

/* ─── Currency formatter ─── */
function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ─── Main Page ─── */
export default function RecepcaoPage() {
  const time = useRealTime();
  const [balanceQuery,    setBalanceQuery]    = useState("");
  const [confirmedNames,  setConfirmedNames]  = useState<Set<string>>(new Set());

  const balanceResult: PatientBalance | null =
    balanceQuery.trim().length >= 2
      ? (PATIENTS_BALANCE.find(p =>
          p.name.toLowerCase().includes(balanceQuery.toLowerCase()) ||
          p.phone.includes(balanceQuery)
        ) ?? null)
      : null;

  function confirmArrival(name: string) {
    setConfirmedNames(prev => new Set(prev).add(name));
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />

      <main className="flex-1 ml-16 overflow-y-auto">

        {/* ── Topbar ── */}
        <div
          className="sticky top-0 z-30 border-b border-white/[0.06] px-6 py-3 flex items-center justify-between"
          style={{ background: "rgba(12,15,26,0.98)" }}
        >
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Olá, Carol! 👋</h1>
            <p className="text-white/40 text-xs">Terça, 27 de maio de 2026</p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(91,141,239,0.11)",
                border: "1px solid rgba(91,141,239,0.24)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#5B8DEF] animate-pulse" />
              <span className="text-xs font-semibold text-[#5B8DEF]">Recepcionista</span>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: "#131726",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Clock size={13} className="text-white/40" />
              <span className="text-sm font-mono font-semibold text-white tabular-nums">
                {time}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ── Linha 1: 4 stat cards ── */}
          <div className="grid grid-cols-4 gap-4">

            {/* Consultas hoje */}
            <div
              className="rounded-2xl p-4 border border-white/[0.06]"
              style={{ background: "#131726" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40">Consultas hoje</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(29,158,117,0.12)" }}
                >
                  <Calendar size={13} className="text-[#1D9E75]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">19</p>
              <p className="text-xs text-white/30 mt-1">Total agendadas</p>
            </div>

            {/* Próximo paciente */}
            <div
              className="rounded-2xl p-4 border border-[#1D9E75]/22"
              style={{ background: "rgba(29,158,117,0.05)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40">Próximo paciente</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(29,158,117,0.14)" }}
                >
                  <User size={13} className="text-[#1D9E75]" />
                </div>
              </div>
              <p className="text-base font-bold text-white leading-tight">João Silva</p>
              <div className="flex items-center gap-1 mt-1.5">
                <Clock size={11} className="text-[#1D9E75]" />
                <p className="text-xs text-[#1D9E75] font-semibold">10:30</p>
              </div>
            </div>

            {/* Confirmadas */}
            <div
              className="rounded-2xl p-4 border border-white/[0.06]"
              style={{ background: "#131726" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40">Confirmadas</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(29,158,117,0.12)" }}
                >
                  <CheckCheck size={13} className="text-[#1D9E75]" />
                </div>
              </div>
              <div className="flex items-end gap-1.5">
                <p className="text-3xl font-bold text-white">14</p>
                <p className="text-sm text-white/30 mb-1">de 19</p>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: "74%", background: "#1D9E75" }}
                />
              </div>
              <p className="text-[10px] text-white/28 mt-1.5">74% confirmadas</p>
            </div>

            {/* Não confirmadas */}
            <div
              className="rounded-2xl p-4 border border-[#CA8A04]/18"
              style={{ background: "rgba(202,138,4,0.05)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40">Não confirmadas</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(202,138,4,0.12)" }}
                >
                  <TriangleAlert size={13} style={{ color: "#CA8A04" }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: "#CA8A04" }}>5</p>
              <p className="text-xs text-white/30 mt-1">Aguardando confirmação</p>
            </div>

          </div>

          {/* ── Linha 2: Próximos pacientes ── */}
          <div
            className="rounded-2xl border border-white/[0.06] overflow-hidden"
            style={{ background: "#131726" }}
          >
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck size={15} className="text-[#1D9E75]" />
                <h2 className="text-white font-semibold text-sm">Próximos pacientes</h2>
              </div>
              <span className="text-xs text-white/28">
                {NEXT_PATIENTS.length} agendamentos
              </span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {NEXT_PATIENTS.map((p, i) => {
                const arrived = confirmedNames.has(p.name);
                return (
                  <div key={i} className="px-5 py-3 flex items-center gap-4">

                    {/* Horário */}
                    <span className="text-sm font-mono font-semibold text-white tabular-nums w-12 flex-shrink-0">
                      {p.time}
                    </span>

                    {/* Paciente */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                        {p.isNew && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ background: "#EA580C1A", color: "#EA580C" }}
                          >
                            NP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/32">{p.phone}</p>
                    </div>

                    {/* Procedimento */}
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: `${PROC_COLOR[p.procedure]}18`,
                        color: PROC_COLOR[p.procedure],
                      }}
                    >
                      {p.procedure}
                    </span>

                    {/* Dentista */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${p.dentistColor}1A`, color: p.dentistColor }}
                      >
                        {p.dentistInitials}
                      </span>
                      <span className="text-xs text-white/38 hidden xl:block">{p.dentist}</span>
                    </div>

                    {/* Status confirmação */}
                    <div className="flex-shrink-0">
                      {p.confirmed ? (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-medium"
                          style={{ background: "rgba(29,158,117,0.11)", color: "#1D9E75" }}
                        >
                          ✓ Confirmado
                        </span>
                      ) : (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-medium"
                          style={{ background: "rgba(202,138,4,0.10)", color: "#CA8A04" }}
                        >
                          ⚠ Pendente
                        </span>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all hover:brightness-110"
                        style={{
                          background: "rgba(91,141,239,0.08)",
                          borderColor: "rgba(91,141,239,0.2)",
                          color: "#5B8DEF",
                        }}
                      >
                        <Phone size={10} />
                        Ligar
                      </button>

                      {arrived ? (
                        <div
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
                          style={{ background: "rgba(29,158,117,0.10)", color: "#1D9E75" }}
                        >
                          <CircleCheck size={10} />
                          Chegou
                        </div>
                      ) : (
                        <button
                          onClick={() => confirmArrival(p.name)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all hover:brightness-110"
                          style={{
                            background: "rgba(29,158,117,0.10)",
                            borderColor: "rgba(29,158,117,0.26)",
                            color: "#1D9E75",
                          }}
                        >
                          <CircleCheck size={10} />
                          Confirmar chegada
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Linha 3: Mini agenda somente leitura ── */}
          <div
            className="rounded-2xl border border-white/[0.06] overflow-hidden"
            style={{ background: "#131726" }}
          >
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-2">
              <Calendar size={15} className="text-[#1D9E75]" />
              <h2 className="text-white font-semibold text-sm">Agenda do dia</h2>
              <span
                className="ml-2 text-[10px] font-medium px-2 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}
              >
                somente leitura
              </span>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/[0.04]">
              {MINI_AGENDA.map(col => (
                <div key={col.dentist} className="p-4">

                  {/* Dentist header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: `${col.color}1A`,
                        color: col.color,
                        border: `1.5px solid ${col.color}35`,
                      }}
                    >
                      {col.initials}
                    </div>
                    <span className="text-sm font-semibold text-white truncate flex-1">{col.dentist}</span>
                    <span className="text-xs text-white/28 flex-shrink-0">
                      {col.appts.filter(a => !a.isBreak).length}
                    </span>
                  </div>

                  {/* Appointments */}
                  <div className="space-y-1.5">
                    {col.appts.map((appt, j) => {
                      if (appt.isBreak) return (
                        <div key={j} className="flex items-center gap-2 py-1 opacity-35">
                          <span className="text-[10px] font-mono text-white/30 w-9 flex-shrink-0">
                            {appt.start}
                          </span>
                          <div className="flex-1 h-px bg-white/10" />
                          <span className="text-[10px] text-white/30">Intervalo</span>
                        </div>
                      );

                      const color = PROC_COLOR[appt.procedure] ?? "#6B7280";
                      return (
                        <div
                          key={j}
                          className="flex items-start gap-2 rounded-lg py-1.5 px-2"
                          style={{
                            background: `${color}0C`,
                            borderLeft: `2.5px solid ${color}55`,
                          }}
                        >
                          <span className="text-[10px] font-mono text-white/35 w-9 flex-shrink-0 pt-px">
                            {appt.start}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-medium text-white truncate">
                                {appt.patient}
                              </span>
                              {appt.isNew && (
                                <span
                                  className="text-[8px] font-bold px-1 rounded flex-shrink-0"
                                  style={{ background: "#EA580C14", color: "#EA580C" }}
                                >
                                  NP
                                </span>
                              )}
                            </div>
                            <span className="text-[9px]" style={{ color }}>
                              {appt.procedure}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ── Linha 4: Dois painéis ── */}
          <div className="grid grid-cols-2 gap-4">

            {/* Painel esquerdo — Consulta de saldo */}
            <div
              className="rounded-2xl border border-white/[0.06] flex flex-col"
              style={{ background: "#131726" }}
            >
              <div className="px-5 py-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-2 mb-0.5">
                  <Search size={15} className="text-[#5B8DEF]" />
                  <h2 className="text-white font-semibold text-sm">
                    Consulta de saldo do paciente
                  </h2>
                </div>
                <p className="text-xs text-white/32">
                  Para atender ligações sobre pagamentos
                </p>
              </div>

              <div className="p-5 flex-1">
                {/* Campo de busca */}
                <div className="relative mb-4">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/28"
                  />
                  <input
                    type="text"
                    value={balanceQuery}
                    onChange={e => setBalanceQuery(e.target.value)}
                    placeholder="Buscar por nome ou telefone…"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 bg-[#1A1F35] border border-white/[0.08] focus:outline-none focus:border-[#5B8DEF]/38 transition-colors"
                  />
                </div>

                {/* Resultado */}
                {balanceQuery.trim().length < 2 && (
                  <div
                    className="rounded-xl border border-white/[0.05] py-10 text-center"
                    style={{ background: "#0C0F1A" }}
                  >
                    <Search size={22} className="text-white/10 mx-auto mb-2" />
                    <p className="text-sm text-white/25">
                      Digite o nome ou telefone do paciente
                    </p>
                  </div>
                )}

                {balanceQuery.trim().length >= 2 && !balanceResult && (
                  <div
                    className="rounded-xl border border-white/[0.05] py-10 text-center"
                    style={{ background: "#0C0F1A" }}
                  >
                    <User size={22} className="text-white/12 mx-auto mb-2" />
                    <p className="text-sm text-white/32">Nenhum paciente encontrado</p>
                    <p className="text-xs text-white/20 mt-1">Verifique nome ou telefone</p>
                  </div>
                )}

                {balanceResult && (
                  <div
                    className="rounded-xl border border-white/[0.07] overflow-hidden"
                    style={{ background: "#0C0F1A" }}
                  >
                    {/* Cabeçalho paciente */}
                    <div className="px-4 py-3 border-b border-white/[0.05] flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm">{balanceResult.name}</p>
                        <p className="text-xs text-white/38 mt-0.5">
                          {balanceResult.treatment} · {balanceResult.phone}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
                        style={{
                          background: STATUS_CFG[balanceResult.status].bg,
                          border: `1px solid ${STATUS_CFG[balanceResult.status].border}`,
                          color: STATUS_CFG[balanceResult.status].color,
                        }}
                      >
                        {STATUS_CFG[balanceResult.status].label}
                      </span>
                    </div>

                    {/* Grade de valores */}
                    <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
                      <div className="px-4 py-3 text-center">
                        <p className="text-xs text-white/30 mb-1">Valor total</p>
                        <p className="text-sm font-bold text-white">
                          {fmtBRL(balanceResult.total)}
                        </p>
                      </div>
                      <div className="px-4 py-3 text-center">
                        <p className="text-xs text-white/30 mb-1">Total pago</p>
                        <p className="text-sm font-bold text-[#1D9E75]">
                          {fmtBRL(balanceResult.paid)}
                        </p>
                      </div>
                      <div className="px-4 py-3 text-center">
                        <p className="text-xs text-white/30 mb-1">Falta pagar</p>
                        <p
                          className="text-sm font-bold"
                          style={{
                            color:
                              balanceResult.remaining === 0
                                ? "#1D9E75"
                                : STATUS_CFG[balanceResult.status].color,
                          }}
                        >
                          {balanceResult.remaining === 0
                            ? "R$ 0,00 ✓"
                            : fmtBRL(balanceResult.remaining)}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="px-4 pt-1 pb-2">
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((balanceResult.paid / balanceResult.total) * 100)
                            )}%`,
                            background:
                              balanceResult.remaining === 0
                                ? "#1D9E75"
                                : STATUS_CFG[balanceResult.status].color,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-white/20 mt-1 text-right">
                        {Math.round((balanceResult.paid / balanceResult.total) * 100)}% pago
                      </p>
                    </div>

                    {/* Próxima parcela */}
                    {balanceResult.remaining > 0 && (
                      <div className="px-4 py-3 border-t border-white/[0.05] flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/30">Próxima parcela</p>
                          <p className="text-sm font-semibold text-white mt-0.5">
                            {balanceResult.nextInstallment}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/30">Vencimento</p>
                          <p
                            className="text-sm font-semibold mt-0.5"
                            style={{
                              color:
                                balanceResult.status === "atraso" ? "#DC2626" : "white",
                            }}
                          >
                            {balanceResult.dueDate}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Painel direito — Alertas do dia */}
            <div
              className="rounded-2xl border border-white/[0.06] flex flex-col"
              style={{ background: "#131726" }}
            >
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-2">
                <Bell size={15} style={{ color: "#CA8A04" }} />
                <h2 className="text-white font-semibold text-sm">Alertas do dia</h2>
              </div>

              <div className="p-5 space-y-5 flex-1">

                {/* Não confirmados */}
                <div>
                  <p className="text-[10px] font-bold text-white/38 uppercase tracking-wider mb-2.5">
                    Não confirmados — ligar agora
                  </p>
                  <div className="space-y-2">
                    {UNCONFIRMED_ALERTS.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-xl"
                        style={{
                          background: "rgba(202,138,4,0.06)",
                          border: "1px solid rgba(202,138,4,0.16)",
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-white leading-tight">
                            {p.name}
                          </p>
                          <p className="text-xs text-white/32">{p.time} · {p.phone}</p>
                        </div>
                        <button
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all hover:brightness-110 flex-shrink-0"
                          style={{
                            background: "rgba(91,141,239,0.10)",
                            borderColor: "rgba(91,141,239,0.22)",
                            color: "#5B8DEF",
                          }}
                        >
                          <Phone size={10} />
                          Ligar
                        </button>
                      </div>
                    ))}
                    <p className="text-[10px] text-white/22 pl-1">
                      +2 sem telefone cadastrado
                    </p>
                  </div>
                </div>

                {/* Horários para encaixe */}
                <div>
                  <p className="text-[10px] font-bold text-white/38 uppercase tracking-wider mb-2.5">
                    Horários livres para encaixe
                  </p>
                  <div className="space-y-1.5">
                    {OPEN_SLOTS.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg"
                        style={{
                          background: "rgba(29,158,117,0.05)",
                          border: "1px solid rgba(29,158,117,0.13)",
                        }}
                      >
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: `${s.color}1A`, color: s.color }}
                        >
                          {s.initials}
                        </span>
                        <span className="text-xs text-white flex-1">{s.slot}</span>
                        <span className="text-[10px] text-[#1D9E75] font-semibold flex-shrink-0">
                          {s.duration} livre
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estoque crítico */}
                <div>
                  <p className="text-[10px] font-bold text-white/38 uppercase tracking-wider mb-2.5">
                    Estoque crítico
                  </p>
                  <div className="space-y-1.5">
                    {CRITICAL_STOCK.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg"
                        style={{
                          background: "rgba(220,38,38,0.06)",
                          border: "1px solid rgba(220,38,38,0.15)",
                        }}
                      >
                        <Package size={11} style={{ color: "#DC2626" }} className="flex-shrink-0" />
                        <span className="text-xs text-white flex-1">{item}</span>
                        <span className="text-[10px] text-white/28">crítico</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aniversariantes */}
                <div>
                  <p className="text-[10px] font-bold text-white/38 uppercase tracking-wider mb-2.5">
                    Aniversariante hoje 🎂
                  </p>
                  <div
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                    style={{
                      background: "rgba(124,58,237,0.07)",
                      border: "1px solid rgba(124,58,237,0.18)",
                    }}
                  >
                    <Cake size={16} style={{ color: "#7C3AED" }} className="flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">Fernanda Lima</p>
                      <p className="text-xs text-white/35">Consulta às 08:00 · Dr. Bruno</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ── Linha 5: Ações rápidas ── */}
          <div
            className="rounded-2xl border border-white/[0.06] p-5"
            style={{ background: "#131726" }}
          >
            <p className="text-[10px] font-semibold text-white/32 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ArrowRight size={11} />
              Ações rápidas
            </p>
            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  label: "+ Novo Agendamento",
                  Icon: CalendarCheck,
                  color: "#1D9E75",
                  bg: "rgba(29,158,117,0.10)",
                  border: "rgba(29,158,117,0.26)",
                },
                {
                  label: "Registrar Chegada",
                  Icon: UserCheck,
                  color: "#5B8DEF",
                  bg: "rgba(91,141,239,0.09)",
                  border: "rgba(91,141,239,0.22)",
                },
                {
                  label: "Encaixe de Urgência",
                  Icon: TriangleAlert,
                  color: "#DC2626",
                  bg: "rgba(220,38,38,0.08)",
                  border: "rgba(220,38,38,0.20)",
                },
                {
                  label: "Buscar Paciente",
                  Icon: Search,
                  color: "#9B6DFF",
                  bg: "rgba(155,109,255,0.09)",
                  border: "rgba(155,109,255,0.22)",
                },
              ].map(({ label, Icon, color, bg, border }) => (
                <button
                  key={label}
                  className="flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl border transition-all hover:brightness-110"
                  style={{ background: bg, borderColor: border }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}16` }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <span
                    className="text-xs font-semibold text-center leading-tight"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
