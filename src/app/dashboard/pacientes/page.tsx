"use client";

import { useState, useMemo } from "react";
import {
  LayoutDashboard, CalendarDays, Users, DollarSign, Package,
  Settings, BarChart2, BrainCircuit, Search, Plus, X, UserCheck, UserX, Stethoscope,
  Phone, Mail, Calendar, ChevronUp, ChevronDown, MoreHorizontal,
  CalendarPlus, FileText, Trash2, Download, RotateCcw, ChevronLeft,
  ChevronRight, Eye, AlertCircle, Sparkles, TrendingUp, CreditCard,
} from "lucide-react";

/* ─── Types ─── */
type PatientStatus = "ATIVO" | "INADIMPLENTE" | "NOVO" | "INATIVO";
type SortDir = "asc" | "desc" | null;
type ReferralOption = "Instagram" | "Indicação" | "Google" | "Outros";
type TreatmentHistoryStatus = "Concluído" | "Em andamento" | "Agendado";

interface Patient {
  id: number;
  name: string;
  age: number;
  phone: string;
  email: string;
  status: PatientStatus;
  treatment: string;
  dentist: string;
  lastVisit: string;
  nextAppt?: string;
  balance: number;
  cpf: string;
  birthdate: string;
  referral: ReferralOption;
}

interface TreatmentHistoryEntry {
  date: string;
  procedure: string;
  dentist: string;
  status: TreatmentHistoryStatus;
  value: number;
}

/* ─── Data ─── */
const PATIENTS: Patient[] = [
  { id: 1,  name: "João Silva",      age: 34, phone: "(11) 98765-4321", email: "joao.silva@email.com",      status: "INADIMPLENTE", treatment: "Implante",    dentist: "Dra. Ana Paula", lastVisit: "10/04/2026",                      balance: 1800, cpf: "123.456.789-01", birthdate: "12/03/1992", referral: "Indicação" },
  { id: 2,  name: "Maria Lopes",     age: 28, phone: "(11) 91234-5678", email: "maria.lopes@email.com",     status: "ATIVO",        treatment: "Ortodontia",  dentist: "Dr. Bruno",     lastVisit: "15/04/2026", nextAppt: "02/06/2026", balance: 980,  cpf: "234.567.890-12", birthdate: "05/07/1998", referral: "Instagram"  },
  { id: 3,  name: "Carlos Mota",     age: 45, phone: "(21) 99876-5432", email: "carlos.mota@email.com",     status: "ATIVO",        treatment: "Clareamento", dentist: "Dra. Ana Paula", lastVisit: "20/04/2026", nextAppt: "05/06/2026", balance: 0,    cpf: "345.678.901-23", birthdate: "22/11/1981", referral: "Google"    },
  { id: 4,  name: "Ana Ferreira",    age: 31, phone: "(11) 97654-3210", email: "ana.ferreira@email.com",    status: "ATIVO",        treatment: "Consulta",    dentist: "Dra. Carla",    lastVisit: "18/04/2026", nextAppt: "28/05/2026", balance: 250,  cpf: "456.789.012-34", birthdate: "30/09/1995", referral: "Indicação" },
  { id: 5,  name: "Pedro Santos",    age: 52, phone: "(31) 98888-7777", email: "pedro.santos@email.com",    status: "INADIMPLENTE", treatment: "Implante",    dentist: "Dra. Ana Paula", lastVisit: "05/03/2026",                      balance: 2400, cpf: "567.890.123-45", birthdate: "14/06/1974", referral: "Google"    },
  { id: 6,  name: "Lucia Rocha",     age: 27, phone: "(11) 96543-2109", email: "lucia.rocha@email.com",     status: "INADIMPLENTE", treatment: "Ortodontia",  dentist: "Dr. Bruno",     lastVisit: "22/04/2026", nextAppt: "01/06/2026", balance: 600,  cpf: "678.901.234-56", birthdate: "18/02/1999", referral: "Instagram"  },
  { id: 7,  name: "Roberto Lima",    age: 38, phone: "(21) 95432-1098", email: "roberto.lima@email.com",    status: "ATIVO",        treatment: "Restauração", dentist: "Dra. Carla",    lastVisit: "25/04/2026", nextAppt: "10/06/2026", balance: 0,    cpf: "789.012.345-67", birthdate: "07/08/1988", referral: "Indicação" },
  { id: 8,  name: "Fernanda Costa",  age: 23, phone: "(11) 94321-0987", email: "fernanda.costa@email.com",  status: "NOVO",         treatment: "Clareamento", dentist: "Dra. Ana Paula", lastVisit: "28/04/2026", nextAppt: "15/06/2026", balance: 0,    cpf: "890.123.456-78", birthdate: "25/01/2003", referral: "Instagram"  },
  { id: 9,  name: "Marcos Souza",    age: 41, phone: "(31) 93210-9876", email: "marcos.souza@email.com",    status: "ATIVO",        treatment: "Implante",    dentist: "Dra. Ana Paula", lastVisit: "26/04/2026", nextAppt: "26/05/2026", balance: 0,    cpf: "901.234.567-89", birthdate: "03/12/1985", referral: "Google"    },
  { id: 10, name: "Patricia Dias",   age: 35, phone: "(11) 92109-8765", email: "patricia.dias@email.com",   status: "ATIVO",        treatment: "Ortodontia",  dentist: "Dr. Bruno",     lastVisit: "27/04/2026", nextAppt: "06/06/2026", balance: 0,    cpf: "012.345.678-90", birthdate: "11/05/1991", referral: "Indicação" },
  { id: 11, name: "Bruno Alves",     age: 29, phone: "(21) 91098-7654", email: "bruno.alves@email.com",     status: "INATIVO",      treatment: "Consulta",    dentist: "Dra. Carla",    lastVisit: "10/01/2026",                      balance: 0,    cpf: "111.222.333-44", birthdate: "29/04/1997", referral: "Outros"    },
  { id: 12, name: "Camila Torres",   age: 33, phone: "(11) 90987-6543", email: "camila.torres@email.com",   status: "NOVO",         treatment: "Restauração", dentist: "Dra. Ana Paula", lastVisit: "29/04/2026", nextAppt: "08/06/2026", balance: 0,    cpf: "222.333.444-55", birthdate: "16/08/1993", referral: "Google"    },
  { id: 13, name: "Diego Martins",   age: 47, phone: "(31) 99876-0000", email: "diego.martins@email.com",   status: "ATIVO",        treatment: "Implante",    dentist: "Dra. Ana Paula", lastVisit: "24/04/2026", nextAppt: "29/05/2026", balance: 0,    cpf: "333.444.555-66", birthdate: "09/02/1979", referral: "Indicação" },
  { id: 14, name: "Juliana Neves",   age: 26, phone: "(11) 98765-1111", email: "juliana.neves@email.com",   status: "NOVO",         treatment: "Ortodontia",  dentist: "Dr. Bruno",     lastVisit: "30/04/2026", nextAppt: "03/06/2026", balance: 0,    cpf: "444.555.666-77", birthdate: "20/11/2000", referral: "Instagram"  },
  { id: 15, name: "Ricardo Faria",   age: 55, phone: "(21) 97654-2222", email: "ricardo.faria@email.com",   status: "INADIMPLENTE", treatment: "Clareamento", dentist: "Dra. Carla",    lastVisit: "08/03/2026",                      balance: 0,    cpf: "555.666.777-88", birthdate: "14/07/1971", referral: "Google"    },
];

const DENTISTS = ["Todos", "Dra. Ana Paula", "Dr. Bruno", "Dra. Carla"];
const TREATMENTS = ["Todos", "Implante", "Ortodontia", "Clareamento", "Restauração", "Consulta"];
const PAGE_SIZE = 10;

/* ─── Colors ─── */
const AVATAR_COLORS = ["#1D9E75", "#5B8DEF", "#EF9F27", "#E24B4A", "#9B6DFF", "#E05FA0"];

/* ─── Treatment history style ─── */
const TS_STYLE: Record<TreatmentHistoryStatus, { bg: string; text: string }> = {
  "Concluído":    { bg: "rgba(29,158,117,0.12)", text: "#1D9E75" },
  "Em andamento": { bg: "rgba(239,159,39,0.12)",  text: "#EF9F27" },
  "Agendado":     { bg: "rgba(91,141,239,0.12)",  text: "#5B8DEF" },
};

/* ─── Helpers ─── */
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function initials(name: string) { return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase(); }
function fmtBRL(v: number) { return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }

function generateTreatmentHistory(p: Patient): TreatmentHistoryEntry[] {
  const entries: TreatmentHistoryEntry[] = [];
  if (p.nextAppt) {
    entries.push({ date: p.nextAppt,  procedure: p.treatment, dentist: p.dentist, status: "Agendado",     value: p.treatment === "Implante" ? 2800 : p.treatment === "Ortodontia" ? 350 : 250 });
  }
  if (p.status !== "NOVO") {
    entries.push({ date: p.lastVisit, procedure: p.treatment, dentist: p.dentist, status: p.nextAppt ? "Em andamento" : p.status === "INADIMPLENTE" ? "Em andamento" : "Concluído", value: p.treatment === "Implante" ? 2800 : p.treatment === "Ortodontia" ? 1800 : p.treatment === "Clareamento" ? 900 : 350 });
  }
  entries.push({ date: "10/01/2026", procedure: "Consulta Inicial", dentist: p.dentist, status: "Concluído", value: 150 });
  if (p.id % 3 === 0) {
    entries.push({ date: "05/10/2025", procedure: "Radiografia Panorâmica", dentist: p.dentist, status: "Concluído", value: 280 });
  }
  return entries;
}

/* ─── SVG ─── */
import { Sidebar } from "@/components/Sidebar";

/* ─── Avatar ─── */
function Avatar({ patient, size = "sm" }: { patient: Patient; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? 64 : 36;
  const font = size === "lg" ? "text-2xl" : "text-sm";
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${font}`}
      style={{ width: dim, height: dim, backgroundColor: avatarColor(patient.id) }}
    >
      {initials(patient.name)}
    </div>
  );
}

/* ─── Status badge ─── */
const STATUS_CONFIG: Record<PatientStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  ATIVO:        { label: "Ativo",        bg: "rgba(29,158,117,0.12)",  text: "#1D9E75", icon: <UserCheck size={11} /> },
  INADIMPLENTE: { label: "Inadimplente", bg: "rgba(226,75,74,0.12)",   text: "#E24B4A", icon: <AlertCircle size={11} /> },
  NOVO:         { label: "Novo",         bg: "rgba(91,141,239,0.12)",  text: "#5B8DEF", icon: <Sparkles size={11} /> },
  INATIVO:      { label: "Inativo",      bg: "rgba(140,140,160,0.15)", text: "#8C8CA0", icon: <UserX size={11} /> },
};

function StatusBadge({ status }: { status: PatientStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.text }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ─── SortTh ─── */
function SortTh({ children, col, sortCol, sortDir, onSort }: {
  children: React.ReactNode; col: string;
  sortCol: string | null; sortDir: SortDir;
  onSort: (col: string) => void;
}) {
  const active = sortCol === col;
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 select-none whitespace-nowrap"
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span className="flex flex-col" style={{ lineHeight: 0 }}>
          <ChevronUp size={10} className={active && sortDir === "asc" ? "text-[#1D9E75]" : "opacity-30"} />
          <ChevronDown size={10} className={active && sortDir === "desc" ? "text-[#1D9E75]" : "opacity-30"} />
        </span>
      </span>
    </th>
  );
}


/* ─── Row menu ─── */
function RowMenu({ patient, onDetail }: { patient: Patient; onDetail: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 rounded-xl border border-white/[0.08] shadow-xl z-20 overflow-hidden" style={{ background: "#1A1F35" }}>
            {[
              { icon: Eye,        label: "Ver detalhes",  action: () => { onDetail(); setOpen(false); } },
              { icon: CalendarPlus, label: "Agendar consulta", action: () => setOpen(false) },
              { icon: CreditCard, label: "Registrar pgto.", action: () => setOpen(false) },
              { icon: FileText,   label: "Ver prontuário", action: () => setOpen(false) },
              { icon: Trash2,     label: "Remover paciente", action: () => setOpen(false), danger: true },
            ].map(({ icon: Icon, label, action, danger }) => (
              <button key={label} onClick={action}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${danger ? "text-[#E24B4A] hover:bg-[#E24B4A]/[0.08]" : "text-white/70 hover:bg-white/[0.06]"}`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── New Patient Modal ─── */
const REFERRAL_OPTIONS: ReferralOption[] = ["Instagram", "Indicação", "Google", "Outros"];

function NewPatientModal({ onClose }: { onClose: () => void }) {
  const [referral, setReferral] = useState<ReferralOption>("Indicação");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden" style={{ background: "#131726" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold text-base">Novo Paciente</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-white/40 mb-1.5">Nome completo *</label>
              <input className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="Ex: Maria Oliveira" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">CPF</label>
              <input className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Data de nascimento</label>
              <input type="date" className="w-full rounded-xl px-3 py-2.5 text-sm text-white/70 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Telefone *</label>
              <input className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="(11) 90000-0000" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">E-mail</label>
              <input type="email" className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Tratamento</label>
              <select className="w-full rounded-xl px-3 py-2.5 text-sm text-white/70 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }}>
                {TREATMENTS.filter(t => t !== "Todos").map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Dentista responsável</label>
              <select className="w-full rounded-xl px-3 py-2.5 text-sm text-white/70 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }}>
                {DENTISTS.filter(d => d !== "Todos").map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-2">Como nos conheceu?</label>
            <div className="flex flex-wrap gap-2">
              {REFERRAL_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setReferral(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${referral === opt ? "border-[#1D9E75] text-[#1D9E75] bg-[#1D9E75]/10" : "border-white/[0.08] text-white/40 hover:border-white/20"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors">Cancelar</button>
          <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] transition-colors">Salvar paciente</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Patient Detail Modal ─── */
function PatientDetailModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const history = generateTreatmentHistory(patient);
  const totalValue = history.reduce((s, e) => s + e.value, 0);
  const totalPaid = Math.max(0, totalValue - patient.balance);
  const paidPct = totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden" style={{ background: "#131726" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold text-base">Detalhes do Paciente</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          {/* Profile hero */}
          <div className="px-6 py-5 flex items-start gap-4 border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Avatar patient={patient} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-white font-bold text-lg">{patient.name}</h3>
                <StatusBadge status={patient.status} />
              </div>
              <p className="text-white/40 text-sm mt-0.5">{patient.age} anos · {patient.treatment} · {patient.dentist}</p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm text-white/50"><Phone size={12} /> {patient.phone}</span>
                <span className="flex items-center gap-1.5 text-sm text-white/50"><Mail size={12} /> {patient.email}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Personal info */}
            <div>
              <h4 className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Dados Pessoais</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "CPF", value: patient.cpf },
                  { label: "Data de nascimento", value: patient.birthdate },
                  { label: "Dentista responsável", value: patient.dentist },
                  { label: "Como nos conheceu", value: patient.referral },
                  { label: "Última visita", value: patient.lastVisit },
                  { label: "Próxima consulta", value: patient.nextAppt ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-3 border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-xs text-white/35 mb-0.5">{label}</p>
                    <p className="text-sm text-white/80 font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div>
              <h4 className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Resumo Financeiro</h4>
              <div className="rounded-xl border border-white/[0.06] p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-white/35">Total em tratamentos</p>
                    <p className="text-sm font-bold text-white mt-0.5">{fmtBRL(totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/35">Valor pago</p>
                    <p className="text-sm font-bold text-[#1D9E75] mt-0.5">{fmtBRL(totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/35">Saldo devedor</p>
                    <p className={`text-sm font-bold mt-0.5 ${patient.balance > 0 ? "text-[#E24B4A]" : "text-white/50"}`}>{fmtBRL(patient.balance)}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>Progresso de pagamento</span>
                    <span>{paidPct}%</span>
                  </div>
                  <div className="h-2 rounded-full w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${paidPct}%`, background: paidPct >= 80 ? "#1D9E75" : paidPct >= 50 ? "#EF9F27" : "#E24B4A" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Next appointment */}
            {patient.nextAppt && (
              <div>
                <h4 className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Próxima Consulta</h4>
                <div className="rounded-xl border border-[#5B8DEF]/20 p-4 flex items-center gap-3" style={{ background: "rgba(91,141,239,0.06)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(91,141,239,0.15)" }}>
                    <Calendar size={16} className="text-[#5B8DEF]" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{patient.treatment}</p>
                    <p className="text-xs text-white/45">{patient.nextAppt} · {patient.dentist}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Treatment history */}
            <div>
              <h4 className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Histórico de Tratamentos</h4>
              <div className="space-y-2">
                {history.map((entry, i) => {
                  const style = TS_STYLE[entry.status];
                  return (
                    <div key={i} className="rounded-xl border border-white/[0.06] p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-white/80 font-medium">{entry.procedure}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: style.bg, color: style.text }}>{entry.status}</span>
                        </div>
                        <p className="text-xs text-white/35 mt-0.5">{entry.date} · {entry.dentist}</p>
                      </div>
                      <span className="text-sm font-semibold text-white/60 whitespace-nowrap">{fmtBRL(entry.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors">Fechar</button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white border border-white/[0.08] hover:bg-white/[0.06] transition-colors">
            <CalendarPlus size={14} /> Agendar consulta
          </button>
          <button className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] transition-colors">
            <CreditCard size={14} /> Registrar pagamento
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-5 flex items-start gap-4" style={{ background: "#131726" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: accent ? `${accent}18` : "rgba(29,158,117,0.12)" }}>
        <Icon size={18} style={{ color: accent ?? "#1D9E75" }} />
      </div>
      <div>
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: accent ?? "#1D9E75" }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "Todos">("Todos");
  const [dentistFilter, setDentistFilter] = useState("Todos");
  const [treatmentFilter, setTreatmentFilter] = useState("Todos");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);

  function handleSort(col: string) {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortCol(null); setSortDir(null); }
    } else {
      setSortCol(col); setSortDir("asc");
    }
    setPage(1);
  }

  const filtered = useMemo(() => {
    let list = [...PATIENTS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.treatment.toLowerCase().includes(q));
    }
    if (statusFilter !== "Todos") list = list.filter(p => p.status === statusFilter);
    if (dentistFilter !== "Todos") list = list.filter(p => p.dentist === dentistFilter);
    if (treatmentFilter !== "Todos") list = list.filter(p => p.treatment === treatmentFilter);

    if (sortCol && sortDir) {
      list.sort((a, b) => {
        let av: string | number = "", bv: string | number = "";
        if (sortCol === "name")      { av = a.name; bv = b.name; }
        else if (sortCol === "age")  { av = a.age;  bv = b.age; }
        else if (sortCol === "balance") { av = a.balance; bv = b.balance; }
        else if (sortCol === "status") { av = a.status; bv = b.status; }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [search, statusFilter, dentistFilter, treatmentFilter, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const totalBalance = PATIENTS.reduce((s, p) => s + p.balance, 0);

  const STATUS_CHIPS: Array<{ label: string; value: PatientStatus | "Todos" }> = [
    { label: "Todos",         value: "Todos" },
    { label: "Ativos",        value: "ATIVO" },
    { label: "Inadimplentes", value: "INADIMPLENTE" },
    { label: "Novos",         value: "NOVO" },
    { label: "Inativos",      value: "INATIVO" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />
      <main className="flex-1 ml-16 min-h-screen">
        {/* Topbar */}
        <div className="sticky top-0 z-20 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between" style={{ background: "rgba(12,15,26,0.95)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-white font-bold text-lg">Pacientes</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(29,158,117,0.12)", color: "#1D9E75" }}>148 ativos</span>
            <span className="text-white/25 text-sm">— Gestão Completa</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors">
              <Download size={14} /> Exportar Lista
            </button>
            <button onClick={() => setShowNewModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] transition-colors">
              <Plus size={14} /> Novo Paciente
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard icon={Users}       label="Pacientes Ativos"    value="148"      sub="+5 este mês"        accent="#1D9E75" />
            <KpiCard icon={Sparkles}    label="Novos este mês"      value="18"       sub="+3 vs. abril"       accent="#5B8DEF" />
            <KpiCard icon={AlertCircle} label="Inadimplentes"       value="6"        sub="R$ 4.800 em aberto" accent="#E24B4A" />
            <KpiCard icon={TrendingUp}  label="Taxa de retorno"     value="72%"      sub="meta: 80%"          accent="#EF9F27" />
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-white/[0.06] p-4 space-y-3" style={{ background: "#131726" }}>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-sm text-white placeholder-white/25 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/40 transition-colors"
                  style={{ background: "#0C0F1A" }} placeholder="Buscar por nome, telefone ou tratamento…"
                />
              </div>
              {/* Status chips */}
              <div className="flex items-center gap-1.5">
                {STATUS_CHIPS.map(({ label, value }) => (
                  <button key={value} onClick={() => { setStatusFilter(value); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${statusFilter === value ? "border-[#1D9E75] text-[#1D9E75] bg-[#1D9E75]/10" : "border-white/[0.08] text-white/40 hover:border-white/20"}`}>
                    {label}
                  </button>
                ))}
              </div>
              {/* Dentist + Treatment dropdowns */}
              <div className="flex items-center gap-2">
                <select value={dentistFilter} onChange={e => { setDentistFilter(e.target.value); setPage(1); }}
                  className="rounded-xl px-3 py-2 text-xs text-white/60 border border-white/[0.08] focus:outline-none transition-colors" style={{ background: "#0C0F1A" }}>
                  {DENTISTS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={treatmentFilter} onChange={e => { setTreatmentFilter(e.target.value); setPage(1); }}
                  className="rounded-xl px-3 py-2 text-xs text-white/60 border border-white/[0.08] focus:outline-none transition-colors" style={{ background: "#0C0F1A" }}>
                  {TREATMENTS.map(t => <option key={t}>{t}</option>)}
                </select>
                {(search || statusFilter !== "Todos" || dentistFilter !== "Todos" || treatmentFilter !== "Todos") && (
                  <button onClick={() => { setSearch(""); setStatusFilter("Todos"); setDentistFilter("Todos"); setTreatmentFilter("Todos"); setPage(1); }}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 border border-white/[0.06] transition-colors">
                    <RotateCcw size={11} /> Limpar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#131726" }}>
            <table className="w-full">
              <thead className="border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <tr>
                  <SortTh col="name"    sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>Paciente</SortTh>
                  <SortTh col="age"     sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>Idade</SortTh>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Telefone</th>
                  <SortTh col="status"  sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>Status</SortTh>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Tratamento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Dentista</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Próx. Consulta</th>
                  <SortTh col="balance" sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>Saldo</SortTh>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {pageItems.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-white/30 text-sm">Nenhum paciente encontrado.</td></tr>
                ) : (
                  pageItems.map(p => {
                    const isInad = p.status === "INADIMPLENTE";
                    return (
                      <tr key={p.id}
                        className="transition-colors"
                        style={{ background: isInad ? "rgba(226,75,74,0.03)" : undefined }}
                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = isInad ? "rgba(226,75,74,0.06)" : "rgba(255,255,255,0.02)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = isInad ? "rgba(226,75,74,0.03)" : ""; }}
                      >
                        <td className="px-4 py-3">
                          <button className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity" onClick={() => setDetailPatient(p)}>
                            <Avatar patient={p} />
                            <span className="text-sm font-medium text-white">{p.name}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/60">{p.age}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{p.phone}</td>
                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 text-sm text-white/60">{p.treatment}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{p.dentist}</td>
                        <td className="px-4 py-3 text-sm text-white/50">
                          {p.nextAppt
                            ? <span className="flex items-center gap-1"><Calendar size={11} className="text-[#5B8DEF]" /> {p.nextAppt}</span>
                            : <span className="text-white/25">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          <span style={{ color: p.balance > 0 ? "#E24B4A" : "#1D9E75" }}>
                            {p.balance > 0 ? fmtBRL(p.balance) : "Quitado"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <RowMenu patient={p} onDetail={() => setDetailPatient(p)} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination + footer */}
            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between" style={{ background: "rgba(255,255,255,0.01)" }}>
              <div className="text-xs text-white/35">
                {filtered.length} paciente{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""} · Saldo devedor total: <span className="font-semibold text-[#E24B4A]">{fmtBRL(totalBalance)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 disabled:opacity-25 hover:text-white hover:bg-white/[0.06] transition-colors">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${safePage === n ? "bg-[#1D9E75] text-white" : "text-white/40 hover:text-white hover:bg-white/[0.06]"}`}>
                    {n}
                  </button>
                ))}
                <button disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 disabled:opacity-25 hover:text-white hover:bg-white/[0.06] transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showNewModal && <NewPatientModal onClose={() => setShowNewModal(false)} />}
      {detailPatient && <PatientDetailModal patient={detailPatient} onClose={() => setDetailPatient(null)} />}
    </div>
  );
}
