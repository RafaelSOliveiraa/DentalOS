"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, User, Phone, Mail, MapPin,
  Stethoscope, Heart, Cigarette, Baby, Activity,
  ClipboardList, FileText, Plus, X, Save,
  Banknote, CreditCard, AlertCircle, CheckCircle2,
  Calendar, Pill, Clock, ArrowRight, HeartPulse,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

/* ─── Types ─── */
type TabType = "Dados Pessoais" | "Anamnese" | "Histórico Clínico" | "Financeiro";
type ParcStatus = "pago" | "atraso" | "pendente";

interface ConsultaEntry {
  id: number;
  date: string;
  dentist: string;
  queixa: string;
  exame: string;
  diagnostico: string;
  tratamento: string;
  prescricao: string;
  proximoPasso: string;
  observacoes: string;
  procedure: string;
  procColor: string;
}

interface Parcela {
  num: number;
  valor: number;
  vencimento: string;
  status: ParcStatus;
  pagamento: string | null;
}

/* ─── Simulated data — João Silva (id=1) ─── */
const PATIENT_DATA = {
  id: 1,
  name: "João Silva",
  cpf: "123.456.789-01",
  birthdate: "12/03/1992",
  age: 34,
  phone: "(11) 98765-4321",
  email: "joao.silva@email.com",
  sexo: "M",
  status: "INADIMPLENTE" as const,
  treatment: "Implante",
  dentist: "Dra. Ana Paula",
  lastVisit: "10/05/2026",
  address: {
    rua: "Rua das Flores, 482",
    bairro: "Vila Mariana",
    cidade: "São Paulo",
    estado: "SP",
    cep: "04120-020",
  },
  referral: "Indicação",
};

const ANAMNESE_DATA = {
  pressao: "140/90 mmHg",
  diabetico: false,
  cardiopatia: false,
  hipertensao: true,
  fumante: false,
  gravida: false,
  alergias: "Dipirona sódica",
  medicamentos: "Losartana 50mg — 1× ao dia\nAAS 100mg — 1× ao dia",
  cirurgias: "Apendicectomia (2015)",
  observacoes:
    "Paciente hipertenso controlado. Verificar pressão arterial antes de procedimentos invasivos. Evitar vasoconstritores em alta concentração.",
  lastUpdated: "10/05/2026",
};

const HISTORICO: ConsultaEntry[] = [
  {
    id: 2,
    date: "10/05/2026",
    dentist: "Dra. Ana Paula",
    queixa: "Dor e inflamação na região do dente 36",
    exame:
      "Cárie profunda com comprometimento pulpar. Dente sem condições de restauração.",
    diagnostico: "Indicação de extração do dente 36",
    tratamento:
      "Extração do dente 36 sob anestesia local. Procedimento sem intercorrências.",
    prescricao:
      "Amoxicilina 500mg 8/8h por 7 dias\nIbuprofeno 600mg 8/8h por 3 dias se dor",
    proximoPasso: "Retorno em 7 dias para revisão da cicatrização. Planejar implante.",
    observacoes:
      "Pressão arterial verificada: 138/88 mmHg. Procedimento bem tolerado.",
    procedure: "Extração",
    procColor: "#DC2626",
  },
  {
    id: 1,
    date: "15/04/2026",
    dentist: "Dra. Ana Paula",
    queixa: "Dor de dente há 3 dias — região posterior inferior esquerda",
    exame:
      "Radiografia panorâmica realizada. Cárie extensa no dente 36 com provável envolvimento pulpar.",
    diagnostico: "Cárie profunda dente 36 — avaliar extração",
    tratamento:
      "Avaliação completa e planejamento do tratamento. Radiografia panorâmica.",
    prescricao: "Analgésico para controle da dor",
    proximoPasso: "Retorno em 15 dias para extração planejada do dente 36",
    observacoes:
      "Paciente hipertenso. PA: 142/92 mmHg. Encaminhar para implante após extração.",
    procedure: "Avaliação inicial",
    procColor: "#5B8DEF",
  },
];

const PARCELAS: Parcela[] = [
  { num: 1, valor: 1000, vencimento: "15/02/2026", status: "pago",     pagamento: "14/02/2026" },
  { num: 2, valor: 1000, vencimento: "15/03/2026", status: "pago",     pagamento: "18/03/2026" },
  { num: 3, valor: 1000, vencimento: "15/04/2026", status: "pago",     pagamento: "20/04/2026" },
  { num: 4, valor:  600, vencimento: "15/05/2026", status: "atraso",   pagamento: null         },
  { num: 5, valor:  600, vencimento: "15/06/2026", status: "pendente", pagamento: null         },
  { num: 6, valor:  600, vencimento: "15/07/2026", status: "pendente", pagamento: null         },
];

const TOTAL   = 4800;
const PAID    = 3000;
const REMAINING = 1800;

/* ─── Helpers ─── */
function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const PARC_CFG: Record<ParcStatus, { label: string; color: string; bg: string; border: string }> = {
  pago:     { label: "Pago",     color: "#1D9E75", bg: "rgba(29,158,117,0.10)",  border: "rgba(29,158,117,0.22)" },
  atraso:   { label: "Em atraso",color: "#DC2626", bg: "rgba(220,38,38,0.10)",   border: "rgba(220,38,38,0.22)"  },
  pendente: { label: "Pendente", color: "#CA8A04", bg: "rgba(202,138,4,0.10)",   border: "rgba(202,138,4,0.22)"  },
};

/* ─── YesNo Toggle ─── */
function YesNoToggle({
  value,
  onChange,
  reverseColors = true,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  reverseColors?: boolean;
}) {
  return (
    <div
      className="flex rounded-lg overflow-hidden border border-white/[0.08]"
      style={{ background: "#0C0F1A" }}
    >
      {([true, false] as const).map(v => {
        const active = value === v;
        const isYes = v === true;
        const activeColor = reverseColors
          ? isYes ? "#DC2626" : "#1D9E75"
          : isYes ? "#1D9E75" : "#DC2626";
        const activeBg = reverseColors
          ? isYes ? "rgba(220,38,38,0.12)" : "rgba(29,158,117,0.10)"
          : isYes ? "rgba(29,158,117,0.10)" : "rgba(220,38,38,0.12)";

        return (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            className="px-5 py-1.5 text-xs font-semibold transition-all"
            style={{
              background: active ? activeBg : "transparent",
              color: active ? activeColor : "rgba(255,255,255,0.35)",
            }}
          >
            {isYes ? "Sim" : "Não"}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Modal Registrar Consulta ─── */
function RegistrarConsultaModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    date: "2026-05-27",
    dentist: "Dra. Ana Paula",
    queixa: "",
    exame: "",
    diagnostico: "",
    tratamento: "",
    prescricao: "",
    proximoPasso: "",
    observacoes: "",
  });

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value })),
    };
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 bg-[#0C0F1A] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/38 transition-colors resize-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/[0.08] flex flex-col overflow-hidden"
        style={{ background: "#131726", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-none">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(29,158,117,0.12)" }}
            >
              <Plus size={16} className="text-[#1D9E75]" />
            </div>
            <h2 className="text-white font-bold text-base">Registrar Consulta</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Data</label>
              <input type="date" {...field("date")} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Dentista</label>
              <select {...field("dentist")} className={inputCls}>
                <option>Dra. Ana Paula</option>
                <option>Dr. Bruno</option>
                <option>Dra. Carla</option>
              </select>
            </div>
          </div>

          {[
            { key: "queixa" as const,      label: "Queixa principal",     rows: 2, placeholder: "Descreva a queixa do paciente…" },
            { key: "exame" as const,       label: "Exame clínico",        rows: 2, placeholder: "Descreva os achados do exame…" },
            { key: "diagnostico" as const, label: "Diagnóstico",          rows: 2, placeholder: "Diagnóstico clínico…" },
            { key: "tratamento" as const,  label: "Tratamento realizado", rows: 2, placeholder: "Descreva o tratamento executado…" },
            { key: "prescricao" as const,  label: "Prescrição",           rows: 2, placeholder: "Medicamentos prescritos…" },
            { key: "proximoPasso" as const,label: "Próximo passo",        rows: 1, placeholder: "Ex: Retorno em 7 dias para reavaliação" },
            { key: "observacoes" as const, label: "Observações",          rows: 2, placeholder: "Observações gerais…" },
          ].map(({ key, label, rows, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
              <textarea
                rows={rows}
                placeholder={placeholder}
                {...field(key)}
                className={inputCls}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06] flex-none">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm text-white/55 border border-white/[0.08] hover:border-white/[0.18] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.22)" }}
          >
            <Save size={14} />
            Salvar consulta
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Dados Pessoais ─── */
function DadosPessoaisTab() {
  const [form, setForm] = useState({
    name:     PATIENT_DATA.name,
    cpf:      PATIENT_DATA.cpf,
    birthdate: PATIENT_DATA.birthdate,
    phone:    PATIENT_DATA.phone,
    email:    PATIENT_DATA.email,
    rua:      PATIENT_DATA.address.rua,
    bairro:   PATIENT_DATA.address.bairro,
    cidade:   PATIENT_DATA.address.cidade,
    estado:   PATIENT_DATA.address.estado,
    cep:      PATIENT_DATA.address.cep,
    referral: PATIENT_DATA.referral,
    dentist:  PATIENT_DATA.dentist,
  });
  const [saved, setSaved] = useState(false);

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 bg-[#0C0F1A] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/38 transition-colors";

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value })),
    };
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">

      {/* Informações pessoais */}
      <section
        className="rounded-2xl border border-white/[0.06] p-6"
        style={{ background: "#131726" }}
      >
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <User size={14} className="text-[#1D9E75]" />
          Informações pessoais
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Nome completo</label>
            <input {...field("name")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">CPF</label>
            <input {...field("cpf")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Data de nascimento</label>
            <input {...field("birthdate")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Telefone</label>
            <input {...field("phone")} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-white/38 mb-1.5 block">E-mail</label>
            <input type="email" {...field("email")} className={inputCls} />
          </div>
        </div>
      </section>

      {/* Endereço */}
      <section
        className="rounded-2xl border border-white/[0.06] p-6"
        style={{ background: "#131726" }}
      >
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-[#1D9E75]" />
          Endereço
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs text-white/38 mb-1.5 block">Rua / Número</label>
            <input {...field("rua")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Bairro</label>
            <input {...field("bairro")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">CEP</label>
            <input {...field("cep")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Cidade</label>
            <input {...field("cidade")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Estado</label>
            <input {...field("estado")} className={inputCls} />
          </div>
        </div>
      </section>

      {/* Clínica */}
      <section
        className="rounded-2xl border border-white/[0.06] p-6"
        style={{ background: "#131726" }}
      >
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Stethoscope size={14} className="text-[#1D9E75]" />
          Informações clínicas
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Dentista responsável</label>
            <select {...field("dentist")} className={inputCls}>
              <option>Dra. Ana Paula</option>
              <option>Dr. Bruno</option>
              <option>Dra. Carla</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Como nos conheceu</label>
            <select {...field("referral")} className={inputCls}>
              {["Indicação", "Instagram", "Google", "Outros"].map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.20)" }}
        >
          <Save size={14} />
          Salvar alterações
        </button>
        {saved && (
          <span className="text-sm text-[#1D9E75] flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            Alterações salvas!
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Tab: Anamnese ─── */
function AnamneseTab() {
  const [form, setForm] = useState(ANAMNESE_DATA);
  const [saved, setSaved] = useState(false);

  const textareaCls =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 bg-[#0C0F1A] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/38 transition-colors resize-none";

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const healthItems: {
    key: "diabetico" | "cardiopatia" | "hipertensao" | "fumante";
    label: string;
    Icon: React.ElementType;
    iconColor: string;
  }[] = [
    { key: "diabetico",    label: "Diabético(a)",         Icon: Activity,   iconColor: "#CA8A04" },
    { key: "cardiopatia",  label: "Cardiopatia",           Icon: Heart,      iconColor: "#DC2626" },
    { key: "hipertensao",  label: "Hipertensão",           Icon: HeartPulse, iconColor: "#DC2626" },
    { key: "fumante",      label: "Fumante",               Icon: Cigarette,  iconColor: "#9B6DFF" },
  ];

  return (
    <div className="space-y-6">

      {/* Histórico de saúde */}
      <section
        className="rounded-2xl border border-white/[0.06] p-6"
        style={{ background: "#131726" }}
      >
        <h3 className="text-sm font-semibold text-white/70 mb-5 flex items-center gap-2">
          <Heart size={14} style={{ color: "#DC2626" }} />
          Histórico de saúde
        </h3>

        {/* Pressão arterial */}
        <div className="mb-5">
          <label className="text-xs text-white/38 mb-1.5 block">Pressão arterial</label>
          <input
            value={form.pressao}
            onChange={e => setForm(f => ({ ...f, pressao: e.target.value }))}
            placeholder="Ex: 120/80 mmHg"
            className="w-full max-w-xs px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 bg-[#0C0F1A] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/38 transition-colors"
          />
        </div>

        {/* Yes/No toggles */}
        <div className="space-y-3">
          {healthItems.map(({ key, label, Icon, iconColor }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${iconColor}14` }}
                >
                  <Icon size={13} style={{ color: iconColor }} />
                </div>
                <span className="text-sm text-white">{label}</span>
                {form[key] && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(220,38,38,0.12)", color: "#DC2626" }}
                  >
                    atenção
                  </span>
                )}
              </div>
              <YesNoToggle
                value={form[key]}
                onChange={v => setForm(f => ({ ...f, [key]: v }))}
              />
            </div>
          ))}

          {/* Grávida — only for female patients */}
          {PATIENT_DATA.sexo === "F" && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(234,88,12,0.12)" }}
                >
                  <Baby size={13} style={{ color: "#EA580C" }} />
                </div>
                <span className="text-sm text-white">Está grávida?</span>
              </div>
              <YesNoToggle
                value={form.gravida}
                onChange={v => setForm(f => ({ ...f, gravida: v }))}
              />
            </div>
          )}
        </div>
      </section>

      {/* Alergias e medicamentos */}
      <section
        className="rounded-2xl border border-white/[0.06] p-6"
        style={{ background: "#131726" }}
      >
        <h3 className="text-sm font-semibold text-white/70 mb-5 flex items-center gap-2">
          <Pill size={14} style={{ color: "#5B8DEF" }} />
          Alergias e medicamentos
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Alergias conhecidas</label>
            <textarea
              rows={2}
              placeholder="Ex: Penicilina, Dipirona…"
              value={form.alergias}
              onChange={e => setForm(f => ({ ...f, alergias: e.target.value }))}
              className={textareaCls}
            />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Medicamentos em uso</label>
            <textarea
              rows={3}
              placeholder="Ex: Nome do medicamento — dose — frequência"
              value={form.medicamentos}
              onChange={e => setForm(f => ({ ...f, medicamentos: e.target.value }))}
              className={textareaCls}
            />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Histórico de cirurgias</label>
            <textarea
              rows={2}
              placeholder="Cirurgias anteriores e datas aproximadas…"
              value={form.cirurgias}
              onChange={e => setForm(f => ({ ...f, cirurgias: e.target.value }))}
              className={textareaCls}
            />
          </div>
        </div>
      </section>

      {/* Observações médicas */}
      <section
        className="rounded-2xl border border-white/[0.06] p-6"
        style={{ background: "#131726" }}
      >
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <ClipboardList size={14} className="text-[#1D9E75]" />
          Observações médicas gerais
        </h3>
        <textarea
          rows={4}
          placeholder="Observações gerais sobre o estado de saúde do paciente…"
          value={form.observacoes}
          onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
          className={textareaCls}
        />
      </section>

      {/* Footer */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.20)" }}
        >
          <Save size={14} />
          Salvar anamnese
        </button>
        {saved ? (
          <span className="text-sm text-[#1D9E75] flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            Anamnese salva!
          </span>
        ) : (
          <p className="text-xs text-white/28">
            <Clock size={10} className="inline mr-1" />
            Última atualização: {ANAMNESE_DATA.lastUpdated}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Tab: Histórico Clínico ─── */
function HistoricoTab() {
  const [entries, setEntries] = useState<ConsultaEntry[]>(HISTORICO);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-4">

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          {entries.length} consulta{entries.length !== 1 ? "s" : ""} registrada{entries.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: "#1D9E75", boxShadow: "0 0 14px rgba(29,158,117,0.20)" }}
        >
          <Plus size={14} />
          Registrar consulta
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-5 top-0 bottom-0 w-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        <div className="space-y-4">
          {entries.map((entry, i) => (
            <div key={entry.id} className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex-none flex flex-col items-center" style={{ width: 40 }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0"
                  style={{
                    background: `${entry.procColor}18`,
                    border: `2px solid ${entry.procColor}55`,
                  }}
                >
                  <Stethoscope size={14} style={{ color: entry.procColor }} />
                </div>
              </div>

              {/* Card */}
              <div
                className="flex-1 rounded-2xl border border-white/[0.06] overflow-hidden mb-2"
                style={{ background: "#131726" }}
              >
                {/* Card header */}
                <div
                  className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between"
                  style={{ borderLeft: `3px solid ${entry.procColor}` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        background: `${entry.procColor}18`,
                        color: entry.procColor,
                      }}
                    >
                      {entry.procedure}
                    </span>
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Calendar size={11} />
                      <span className="text-xs">{entry.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/40">
                      <User size={11} />
                      <span className="text-xs">{entry.dentist}</span>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 py-4 space-y-3">
                  {[
                    { label: "Queixa principal",     value: entry.queixa,       Icon: FileText    },
                    { label: "Diagnóstico",           value: entry.diagnostico,  Icon: ClipboardList },
                    { label: "Tratamento realizado",  value: entry.tratamento,   Icon: Stethoscope },
                    { label: "Prescrição",            value: entry.prescricao,   Icon: Pill        },
                    { label: "Próximo passo",         value: entry.proximoPasso, Icon: ArrowRight  },
                  ].filter(r => r.value).map(({ label, value, Icon }) => (
                    <div key={label} className="flex gap-3">
                      <div className="flex-none w-4 mt-0.5">
                        <Icon size={12} className="text-white/25" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/32 uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-sm text-white/80 leading-relaxed" style={{ whiteSpace: "pre-line" }}>{value}</p>
                      </div>
                    </div>
                  ))}

                  {entry.observacoes && (
                    <div
                      className="flex gap-2 rounded-lg px-3 py-2 mt-1"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <AlertCircle size={12} className="text-white/25 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-white/45 leading-relaxed">{entry.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* End dot */}
          <div className="flex gap-4">
            <div className="flex-none" style={{ width: 40 }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1.5px dashed rgba(255,255,255,0.10)" }}
              >
                <Clock size={12} className="text-white/20" />
              </div>
            </div>
            <div className="flex-1 flex items-center pb-2">
              <p className="text-xs text-white/22">Início do histórico clínico</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <RegistrarConsultaModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

/* ─── Tab: Financeiro ─── */
function FinanceiroTab() {
  const paidPct = Math.round((PAID / TOTAL) * 100);

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Valor total do tratamento", value: fmtBRL(TOTAL),     color: "white",    icon: Banknote },
          { label: "Total pago",                value: fmtBRL(PAID),      color: "#1D9E75",  icon: CheckCircle2 },
          { label: "Falta pagar",               value: fmtBRL(REMAINING), color: "#DC2626",  icon: AlertCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.06] p-5"
            style={{ background: "#131726" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} style={{ color }} />
              <p className="text-xs text-white/38">{label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#131726" }}
      >
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Progresso de pagamento</span>
          <span className="font-semibold text-white">{paidPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${paidPct}%`,
              background: "linear-gradient(90deg, #1D9E75, #2DD4A0)",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/25 mt-1.5">
          <span>{fmtBRL(PAID)} pagos</span>
          <span>{fmtBRL(REMAINING)} restantes</span>
        </div>
      </div>

      {/* Parcelas */}
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#131726" }}
      >
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-[#1D9E75]" />
            <h3 className="text-sm font-semibold text-white">Parcelas</h3>
          </div>
          <span className="text-xs text-white/30">
            {PARCELAS.filter(p => p.status === "pago").length} de {PARCELAS.length} pagas
          </span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {PARCELAS.map(p => {
            const cfg = PARC_CFG[p.status];
            return (
              <div key={p.num} className="px-5 py-3 flex items-center gap-4">
                {/* Parcela num */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: `${cfg.color}18`,
                    color: cfg.color,
                    border: `1.5px solid ${cfg.color}35`,
                  }}
                >
                  {p.num}
                </div>

                {/* Valor */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{fmtBRL(p.valor)}</p>
                  <p className="text-xs text-white/32">
                    Vencimento: {p.vencimento}
                    {p.pagamento && ` · Pago em: ${p.pagamento}`}
                  </p>
                </div>

                {/* Status */}
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-white/[0.05]">
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "#1D9E75", boxShadow: "0 0 14px rgba(29,158,117,0.18)" }}
          >
            <CreditCard size={14} />
            Registrar pagamento
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
const TABS: TabType[] = ["Dados Pessoais", "Anamnese", "Histórico Clínico", "Financeiro"];

const TAB_ICONS: Record<TabType, React.ElementType> = {
  "Dados Pessoais":   User,
  "Anamnese":         Heart,
  "Histórico Clínico":ClipboardList,
  "Financeiro":       Banknote,
};

export default function ProntuarioPage() {
  const params   = useParams();
  const id       = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("Dados Pessoais");

  const patient  = PATIENT_DATA; // demo: always João Silva

  const STATUS_COLOR: Record<string, string> = {
    INADIMPLENTE: "#DC2626",
    ATIVO:        "#1D9E75",
    NOVO:         "#5B8DEF",
    INATIVO:      "#6B7280",
  };
  const statusColor = STATUS_COLOR[patient.status] ?? "#6B7280";

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />

      <main className="flex-1 ml-16 flex flex-col min-h-screen overflow-hidden">

        {/* ── Topbar ── */}
        <div
          className="flex-none border-b border-white/[0.06] px-6 py-3 flex items-center gap-4"
          style={{ background: "rgba(12,15,26,0.98)" }}
        >
          {/* Back */}
          <Link
            href="/dashboard/pacientes"
            className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Pacientes
          </Link>

          <span className="text-white/20">/</span>

          {/* Patient info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: "#1D9E75" }}
            >
              JS
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-base leading-tight truncate">
                  {patient.name}
                </h1>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${statusColor}18`, color: statusColor }}
                >
                  {patient.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-white/35">{patient.age} anos</span>
                <span className="text-xs text-white/20">·</span>
                <span className="text-xs text-white/35 flex items-center gap-1">
                  <Phone size={10} />
                  {patient.phone}
                </span>
                <span className="text-xs text-white/20">·</span>
                <span className="text-xs text-white/35 flex items-center gap-1">
                  <Stethoscope size={10} />
                  {patient.treatment}
                </span>
                <span className="text-xs text-white/20">·</span>
                <span className="text-xs text-white/35">
                  Última visita: {patient.lastVisit}
                </span>
              </div>
            </div>
          </div>

          {/* CPF chip */}
          <div
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs text-white/35 border border-white/[0.06]"
            style={{ background: "#131726" }}
          >
            CPF {patient.cpf}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div
          className="flex-none border-b border-white/[0.06] px-6 flex items-end gap-1"
          style={{ background: "rgba(12,15,26,0.95)" }}
        >
          {TABS.map(tab => {
            const Icon = TAB_ICONS[tab];
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all relative"
                style={{
                  borderColor: active ? "#1D9E75" : "transparent",
                  color:       active ? "#1D9E75" : "rgba(255,255,255,0.38)",
                }}
              >
                <Icon size={13} />
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "Dados Pessoais"   && <DadosPessoaisTab />}
          {activeTab === "Anamnese"          && <AnamneseTab />}
          {activeTab === "Histórico Clínico" && <HistoricoTab />}
          {activeTab === "Financeiro"        && <FinanceiroTab />}
        </div>

      </main>
    </div>
  );
}
