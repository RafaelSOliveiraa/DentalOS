"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutDashboard, CalendarDays, Users, DollarSign, Package,
  Settings, BarChart2, BrainCircuit, Search, Plus, X, UserCheck, UserX, Stethoscope,
  Phone, Mail, Calendar, ChevronUp, ChevronDown, MoreHorizontal,
  CalendarPlus, FileText, Trash2, Download, RotateCcw, ChevronLeft,
  ChevronRight, Eye, AlertCircle, Sparkles, TrendingUp, CreditCard,
  LoaderCircle,
} from "lucide-react";
import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { fetchPacientes, createPaciente, fetchDentistas } from "@/lib/queries";

/* ─── Types ─── */
type PatientStatus = "ATIVO" | "INADIMPLENTE" | "NOVO" | "INATIVO";
type SortDir = "asc" | "desc" | null;
type ReferralOption = "Instagram" | "Indicação" | "Google" | "Outros";
type TreatmentHistoryStatus = "Concluído" | "Em andamento" | "Agendado";

interface Patient {
  id: number;
  dbId?: string;       // real Supabase UUID — used for navigation to prontuário
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
  const router = useRouter();
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
              { icon: FileText,   label: "Ver prontuário", action: () => { router.push(`/dashboard/pacientes/${patient.dbId ?? patient.id}/prontuario`); setOpen(false); } },
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
  const qc = useQueryClient();

  /* Controlled fields */
  const [nome,           setNome]           = useState("");
  const [cpf,            setCpf]            = useState("");
  const [dataNasc,       setDataNasc]       = useState("");
  const [telefone,       setTelefone]       = useState("");
  const [email,          setEmail]          = useState("");
  const [tratamento,     setTratamento]     = useState("Consulta");
  const [dentistaId,     setDentistaId]     = useState("");
  const [comoConheceu,   setComoConheceu]   = useState<ReferralOption>("Indicação");
  const [sexo,           setSexo]           = useState("F");

  /* Fetch dentistas for dropdown */
  const { data: dbDentistas = [] } = useQuery({
    queryKey: ["dentistas"],
    queryFn:  fetchDentistas,
  });

  /* Create mutation */
  const saveMut = useMutation({
    mutationFn: () => {
      // P1: store the dentist NAME (not UUID) so the list shows it correctly
      const dentistaNome =
        dbDentistas.find(d => d.id === dentistaId)?.nome ??
        (dentistaId || null);
      return createPaciente({
        nome,
        cpf:                  cpf || null,
        data_nascimento:      dataNasc || null,
        telefone:             telefone || null,
        email:                email || null,
        sexo,
        como_conheceu:        comoConheceu,
        dentista_responsavel: dentistaNome,
        status:               "NOVO",
        tratamento:           tratamento || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pacientes"] });
      toast.success("Paciente cadastrado com sucesso!");
      onClose();
    },
    onError: (e: Error) => toast.error(`Erro ao cadastrar: ${e.message}`),
  });

  const inputCls =
    "w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors";
  const inputStyle = { background: "#0C0F1A" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden" style={{ background: "#131726" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold text-base">Novo Paciente</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Nome */}
            <div className="col-span-2">
              <label className="block text-xs text-white/40 mb-1.5">Nome completo *</label>
              <input
                value={nome} onChange={e => setNome(e.target.value)}
                className={inputCls} style={inputStyle}
                placeholder="Ex: Maria Oliveira"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">CPF</label>
              <input
                value={cpf} onChange={e => setCpf(e.target.value)}
                className={inputCls} style={inputStyle}
                placeholder="000.000.000-00"
              />
            </div>

            {/* Data de nascimento */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Data de nascimento</label>
              <input
                type="date" value={dataNasc} onChange={e => setDataNasc(e.target.value)}
                className={inputCls + " text-white/70"} style={inputStyle}
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Telefone *</label>
              <input
                value={telefone} onChange={e => setTelefone(e.target.value)}
                className={inputCls} style={inputStyle}
                placeholder="(11) 90000-0000"
              />
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className={inputCls} style={inputStyle}
                placeholder="email@exemplo.com"
              />
            </div>

            {/* Tratamento */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Tratamento</label>
              <select
                value={tratamento} onChange={e => setTratamento(e.target.value)}
                className={inputCls + " text-white/70"} style={inputStyle}
              >
                {TREATMENTS.filter(t => t !== "Todos").map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Dentista */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Dentista responsável</label>
              <select
                value={dentistaId} onChange={e => setDentistaId(e.target.value)}
                className={inputCls + " text-white/70"} style={inputStyle}
              >
                <option value="">Selecionar…</option>
                {dbDentistas.length > 0
                  ? dbDentistas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)
                  : DENTISTS.filter(d => d !== "Todos").map(d => <option key={d} value={d}>{d}</option>)
                }
              </select>
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Sexo</label>
              <select
                value={sexo} onChange={e => setSexo(e.target.value)}
                className={inputCls + " text-white/70"} style={inputStyle}
              >
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
                <option value="O">Outro</option>
              </select>
            </div>
          </div>

          {/* Como conheceu */}
          <div>
            <label className="block text-xs text-white/40 mb-2">Como nos conheceu?</label>
            <div className="flex flex-wrap gap-2">
              {REFERRAL_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setComoConheceu(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${comoConheceu === opt ? "border-[#1D9E75] text-[#1D9E75] bg-[#1D9E75]/10" : "border-white/[0.08] text-white/40 hover:border-white/20"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending || !nome.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] disabled:opacity-60 transition-colors"
          >
            {saveMut.isPending
              ? <LoaderCircle size={14} className="animate-spin" />
              : null}
            Salvar paciente
          </button>
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
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dbSearch, setDbSearch] = useState(""); // debounced for Supabase
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "Todos">("Todos");
  const [dentistFilter, setDentistFilter] = useState("Todos");
  const [treatmentFilter, setTreatmentFilter] = useState("Todos");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);

  /* Debounce search → Supabase */
  useEffect(() => {
    const t = setTimeout(() => setDbSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  /* Query: pacientes from Supabase */
  const { data: dbPacientes, isLoading: loadingPacientes } = useQuery({
    queryKey: ["pacientes", dbSearch],
    queryFn:  () => fetchPacientes(dbSearch),
    staleTime: 20_000,
  });

  /* P6/P7: Map ONLY Supabase rows — never fall back to static demo data */
  const allPatients: Patient[] = useMemo(() => {
    if (!dbPacientes) return [];   // still loading — show skeleton
    return dbPacientes.map(p => ({
      id:         Number(p.id.replace(/-/g, "").slice(0, 8) || 0) || Math.random(),
      dbId:       p.id,   // real UUID used for prontuário navigation
      name:       p.nome,
      age:        p.data_nascimento
        ? Math.floor((Date.now() - new Date(p.data_nascimento).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : 0,
      phone:      p.telefone ?? "—",
      email:      p.email ?? "—",
      status:     (p.status ?? "ATIVO") as PatientStatus,
      treatment:  p.tratamento ?? "—",
      dentist:    p.dentista_responsavel ?? "—",
      lastVisit:  "—",
      balance:    0,
      cpf:        p.cpf ?? "—",
      birthdate:  p.data_nascimento ?? "—",
      referral:   (p.como_conheceu ?? "Outros") as ReferralOption,
    }));
  }, [dbPacientes]);

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
    let list = [...allPatients];
    // Local filters (status/dentist/treatment) still applied client-side
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
  }, [allPatients, statusFilter, dentistFilter, treatmentFilter, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const totalBalance = allPatients.reduce((s, p) => s + p.balance, 0);

  /* KPIs computados a partir dos dados reais */
  const kpiAtivos        = allPatients.filter(p => p.status === "ATIVO").length;
  const kpiNovos         = allPatients.filter(p => p.status === "NOVO").length;
  const kpiInadimplentes = allPatients.filter(p => p.status === "INADIMPLENTE").length;

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
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(29,158,117,0.12)", color: "#1D9E75" }}>{kpiAtivos} ativo{kpiAtivos !== 1 ? "s" : ""}</span>
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
            <KpiCard icon={Users}       label="Pacientes Ativos"   value={String(kpiAtivos)}         sub={kpiAtivos === 0 ? "Nenhum cadastrado" : kpiAtivos + " ativo" + (kpiAtivos !== 1 ? "s" : "")}                 accent="#1D9E75" />
            <KpiCard icon={Sparkles}    label="Novos"              value={String(kpiNovos)}          sub={kpiNovos === 0 ? "Nenhum novo" : kpiNovos + " novo" + (kpiNovos !== 1 ? "s" : "")}                          accent="#5B8DEF" />
            <KpiCard icon={AlertCircle} label="Inadimplentes"      value={String(kpiInadimplentes)}  sub={kpiInadimplentes === 0 ? "Nenhum em atraso" : kpiInadimplentes + " com pendência"}                           accent="#E24B4A" />
            <KpiCard icon={TrendingUp}  label="Total de pacientes" value={String(allPatients.length)} sub={allPatients.length === 0 ? "Nenhum cadastrado" : allPatients.length + " no total"}                          accent="#EF9F27" />
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-white/[0.06] p-4 space-y-3" style={{ background: "#131726" }}>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                {loadingPacientes
                  ? <LoaderCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1D9E75] animate-spin" />
                  : <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                }
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
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loadingPacientes ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
                ) : allPatients.length === 0 && !search && statusFilter === "Todos" && dentistFilter === "Todos" && treatmentFilter === "Todos" ? (
                  /* P6: DB is genuinely empty — no patients at all */
                  <tr>
                    <td colSpan={9}>
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <Users size={32} className="text-white/20" />
                        </div>
                        <div className="text-center">
                          <p className="text-white/50 font-medium mb-1">Nenhum paciente cadastrado ainda</p>
                          <p className="text-white/25 text-sm">Clique no botão abaixo para adicionar o primeiro paciente</p>
                        </div>
                        <button
                          onClick={() => setShowNewModal(true)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] transition-colors"
                        >
                          <Plus size={14} /> Novo Paciente
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-white/30 text-sm">Nenhum paciente encontrado com os filtros atuais.</td></tr>
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
                          <div className="flex items-center gap-0.5">
                            <Link
                              href={`/dashboard/pacientes/${p.dbId ?? p.id}/prontuario`}
                              title="Ver prontuário"
                              className="p-1.5 rounded-lg text-white/30 hover:text-[#5B8DEF] hover:bg-[#5B8DEF]/[0.08] transition-colors"
                            >
                              <FileText size={15} />
                            </Link>
                            <RowMenu patient={p} onDetail={() => setDetailPatient(p)} />
                          </div>
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
