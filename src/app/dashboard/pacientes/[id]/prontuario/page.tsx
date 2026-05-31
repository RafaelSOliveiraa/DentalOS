"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronLeft, User, Phone, MapPin,
  Stethoscope, Heart, Cigarette, Baby, Activity,
  ClipboardList, FileText, Plus, X, Save,
  Banknote, CreditCard, AlertCircle, CheckCircle2,
  Calendar, Pill, Clock, ArrowRight, HeartPulse, LoaderCircle,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  fetchAnamnese,
  upsertAnamnese,
  fetchConsultas,
  createConsulta,
  fetchPacienteById,
  updatePaciente,
  fetchDentistas,
  fetchFinanceiroPaciente,
  createFinanceiroPaciente,
  fetchParcelas,
  createParcelas,
  updateParcela,
} from "@/lib/queries";
import type {
  PacienteRow,
  DentistaRow,
  FinanceiroPacienteRow,
  ParcelaRow,
} from "@/lib/supabase";

/* ─── Types ─── */
type TabType = "Dados Pessoais" | "Anamnese" | "Histórico Clínico" | "Financeiro";
type ParcStatus = "pago" | "atraso" | "pendente";

/* ─── Helpers ─── */
function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const PARC_CFG: Record<ParcStatus, { label: string; color: string; bg: string; border: string }> = {
  pago:     { label: "Pago",      color: "#1D9E75", bg: "rgba(29,158,117,0.10)",  border: "rgba(29,158,117,0.22)" },
  atraso:   { label: "Em atraso", color: "#DC2626", bg: "rgba(220,38,38,0.10)",   border: "rgba(220,38,38,0.22)"  },
  pendente: { label: "Pendente",  color: "#CA8A04", bg: "rgba(202,138,4,0.10)",   border: "rgba(202,138,4,0.22)"  },
};

/* ─── YesNoToggle ─── */
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

/* ─── Modal: Registrar Consulta ─── */
function RegistrarConsultaModal({
  pacienteId,
  onClose,
}: {
  pacienteId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { data: dentistas = [] } = useQuery({
    queryKey: ["dentistas"],
    queryFn: fetchDentistas,
  });

  const [form, setForm] = useState({
    data_consulta:        new Date().toISOString().split("T")[0],
    dentista_nome:        "",
    tipo_consulta:        "Consulta",
    queixa_principal:     "",
    exame_clinico:        "",
    diagnostico:          "",
    tratamento_realizado: "",
    prescricao:           "",
    proximo_passo:        "",
    observacoes:          "",
  });

  const saveMut = useMutation({
    mutationFn: () =>
      createConsulta({
        paciente_id:          pacienteId,
        dentista_nome:        form.dentista_nome        || null,
        data_consulta:        form.data_consulta,
        tipo_consulta:        form.tipo_consulta        || null,
        queixa_principal:     form.queixa_principal     || null,
        exame_clinico:        form.exame_clinico        || null,
        diagnostico:          form.diagnostico          || null,
        tratamento_realizado: form.tratamento_realizado || null,
        prescricao:           form.prescricao           || null,
        proximo_passo:        form.proximo_passo        || null,
        observacoes:          form.observacoes          || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultas", pacienteId] });
      toast.success("Consulta registrada com sucesso!");
      onClose();
    },
    onError: (e: Error) => toast.error(`Erro ao registrar: ${e.message}`),
  });

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

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Data</label>
              <input
                type="date"
                value={form.data_consulta}
                onChange={e => setForm(f => ({ ...f, data_consulta: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Dentista</label>
              <select
                value={form.dentista_nome}
                onChange={e => setForm(f => ({ ...f, dentista_nome: e.target.value }))}
                className={inputCls}
              >
                <option value="">Selecione o dentista</option>
                {dentistas.map(d => (
                  <option key={d.id} value={d.nome}>{d.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Tipo de consulta</label>
            <select
              value={form.tipo_consulta}
              onChange={e => setForm(f => ({ ...f, tipo_consulta: e.target.value }))}
              className={inputCls}
            >
              {["Avaliação", "Consulta", "Limpeza", "Extração", "Restauração", "Canal", "Implante", "Ortodontia", "Outros"].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {([
            { key: "queixa_principal"     as const, label: "Queixa principal",     rows: 2, placeholder: "Descreva a queixa do paciente…"      },
            { key: "exame_clinico"        as const, label: "Exame clínico",        rows: 2, placeholder: "Descreva os achados do exame…"        },
            { key: "diagnostico"          as const, label: "Diagnóstico",          rows: 2, placeholder: "Diagnóstico clínico…"                 },
            { key: "tratamento_realizado" as const, label: "Tratamento realizado", rows: 2, placeholder: "Descreva o tratamento executado…"     },
            { key: "prescricao"           as const, label: "Prescrição",           rows: 2, placeholder: "Medicamentos prescritos…"             },
            { key: "proximo_passo"        as const, label: "Próximo passo",        rows: 1, placeholder: "Ex: Retorno em 7 dias para reavaliação" },
            { key: "observacoes"          as const, label: "Observações",          rows: 2, placeholder: "Observações gerais…"                  },
          ] as const).map(({ key, label, rows, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
              <textarea
                rows={rows}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
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
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.22)" }}
          >
            {saveMut.isPending
              ? <LoaderCircle size={14} className="animate-spin" />
              : <Save size={14} />}
            Salvar consulta
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: Novo Tratamento ─── */
function NovoTratamentoModal({
  pacienteId,
  onClose,
}: {
  pacienteId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    descricao:             "",
    valor_total:           "",
    num_parcelas:          "1",
    data_primeira_parcela: new Date().toISOString().split("T")[0],
  });

  const total       = parseFloat(form.valor_total) || 0;
  const numParcelas = Math.max(1, parseInt(form.num_parcelas) || 1);
  const valorParcela = total / numParcelas;

  const parcelasPreview = Array.from({ length: numParcelas }, (_, i) => {
    const d = new Date(form.data_primeira_parcela + "T12:00:00");
    d.setMonth(d.getMonth() + i);
    return {
      num:        i + 1,
      valor:      valorParcela,
      vencimento: d.toISOString().split("T")[0],
    };
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const financeiro = await createFinanceiroPaciente({
        paciente_id:           pacienteId,
        descricao:             form.descricao,
        valor_total:           total,
        num_parcelas:          numParcelas,
        data_primeira_parcela: form.data_primeira_parcela,
        valor_pago:            0,
      });

      const parcelasPayload = parcelasPreview.map(p => ({
        financeiro_paciente_id: financeiro.id,
        paciente_id:            pacienteId,
        num_parcela:            p.num,
        valor:                  p.valor,
        vencimento:             p.vencimento,
        status:                 "pendente" as const,
        data_pagamento:         null,
        forma_pagamento:        null,
        valor_pago:             null,
      }));

      await createParcelas(parcelasPayload);
      return financeiro;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro", pacienteId] });
      qc.invalidateQueries({ queryKey: ["parcelas",   pacienteId] });
      toast.success("Tratamento registrado com sucesso!");
      onClose();
    },
    onError: (e: Error) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  const inputCls =
    "w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 bg-[#0C0F1A] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/38 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.08] flex flex-col overflow-hidden"
        style={{ background: "#131726", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-none">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(29,158,117,0.12)" }}
            >
              <Banknote size={16} className="text-[#1D9E75]" />
            </div>
            <h2 className="text-white font-bold text-base">Registrar Tratamento</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Descrição do tratamento</label>
            <input
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Ex: Implante dente 36…"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Valor total (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valor_total}
                onChange={e => setForm(f => ({ ...f, valor_total: e.target.value }))}
                placeholder="0,00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Número de parcelas</label>
              <select
                value={form.num_parcelas}
                onChange={e => setForm(f => ({ ...f, num_parcelas: e.target.value }))}
                className={inputCls}
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}×</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Data da primeira parcela</label>
            <input
              type="date"
              value={form.data_primeira_parcela}
              onChange={e => setForm(f => ({ ...f, data_primeira_parcela: e.target.value }))}
              className={inputCls}
            />
          </div>

          {total > 0 && (
            <div
              className="rounded-xl border border-white/[0.06] overflow-hidden"
              style={{ background: "#0C0F1A" }}
            >
              <p className="text-xs text-white/40 px-4 py-2.5 border-b border-white/[0.06]">
                Prévia: {numParcelas}× de {fmtBRL(valorParcela)}
              </p>
              <div className="max-h-40 overflow-y-auto divide-y divide-white/[0.04]">
                {parcelasPreview.map(p => (
                  <div key={p.num} className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs text-white/50">Parcela {p.num}</span>
                    <span className="text-xs text-white/70">{fmtBRL(p.valor)}</span>
                    <span className="text-xs text-white/40">
                      {new Date(p.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending || !form.descricao.trim() || total <= 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.22)" }}
          >
            {saveMut.isPending
              ? <LoaderCircle size={14} className="animate-spin" />
              : <Save size={14} />}
            Salvar tratamento
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: Registrar Pagamento ─── */
function RegistrarPagamentoModal({
  pacienteId,
  parcelas,
  onClose,
}: {
  pacienteId: string;
  parcelas: ParcelaRow[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const pendentes = parcelas.filter(p => p.status !== "pago");

  const [selectedId, setSelectedId] = useState(pendentes[0]?.id ?? "");
  const [form, setForm] = useState({
    valor_pago:       String(pendentes[0]?.valor ?? ""),
    data_pagamento:   new Date().toISOString().split("T")[0],
    forma_pagamento:  "PIX",
  });

  // Sync valor when parcela selection changes
  useEffect(() => {
    const p = parcelas.find(p => p.id === selectedId);
    if (p) setForm(f => ({ ...f, valor_pago: String(p.valor) }));
  }, [selectedId, parcelas]);

  const saveMut = useMutation({
    mutationFn: () =>
      updateParcela(selectedId, {
        status:          "pago",
        data_pagamento:  form.data_pagamento,
        forma_pagamento: form.forma_pagamento,
        valor_pago:      parseFloat(form.valor_pago) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parcelas",   pacienteId] });
      qc.invalidateQueries({ queryKey: ["financeiro", pacienteId] });
      toast.success("Pagamento registrado!");
      onClose();
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });

  const inputCls =
    "w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 bg-[#0C0F1A] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/38 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/[0.08] flex flex-col overflow-hidden"
        style={{ background: "#131726" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(29,158,117,0.12)" }}
            >
              <CreditCard size={16} className="text-[#1D9E75]" />
            </div>
            <h2 className="text-white font-bold text-base">Registrar Pagamento</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {pendentes.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle2 size={28} className="mx-auto mb-2 text-[#1D9E75]/60" />
              <p className="text-sm text-white/50">Todas as parcelas já foram pagas.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Parcela</label>
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className={inputCls}
                >
                  {pendentes.map(p => (
                    <option key={p.id} value={p.id}>
                      Parcela {p.num_parcela} — {fmtBRL(p.valor)} — venc.{" "}
                      {new Date(p.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Valor pago (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valor_pago}
                  onChange={e => setForm(f => ({ ...f, valor_pago: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Data do pagamento</label>
                <input
                  type="date"
                  value={form.data_pagamento}
                  onChange={e => setForm(f => ({ ...f, data_pagamento: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Forma de pagamento</label>
                <div className="grid grid-cols-4 gap-2">
                  {["Dinheiro", "PIX", "Cartão", "Boleto"].map(forma => (
                    <button
                      key={forma}
                      onClick={() => setForm(f => ({ ...f, forma_pagamento: forma }))}
                      className="py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: form.forma_pagamento === forma
                          ? "rgba(29,158,117,0.15)"
                          : "rgba(255,255,255,0.04)",
                        color: form.forma_pagamento === forma
                          ? "#1D9E75"
                          : "rgba(255,255,255,0.45)",
                        border: form.forma_pagamento === forma
                          ? "1px solid rgba(29,158,117,0.35)"
                          : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {forma}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm text-white/55 border border-white/[0.08] hover:border-white/[0.18] transition-all"
          >
            Cancelar
          </button>
          {pendentes.length > 0 && (
            <button
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending || !selectedId}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
              style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.22)" }}
            >
              {saveMut.isPending
                ? <LoaderCircle size={14} className="animate-spin" />
                : <CheckCircle2 size={14} />}
              Confirmar pagamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Dados Pessoais ─── */
function DadosPessoaisTab({
  pacienteId,
  dbPaciente,
  dentistas,
}: {
  pacienteId: string;
  dbPaciente: PacienteRow | undefined;
  dentistas: DentistaRow[];
}) {
  const qc = useQueryClient();

  const [form, setForm] = useState({
    nome:                 dbPaciente?.nome                ?? "",
    cpf:                  dbPaciente?.cpf                 ?? "",
    data_nascimento:      dbPaciente?.data_nascimento      ?? "",
    telefone:             dbPaciente?.telefone             ?? "",
    email:                dbPaciente?.email               ?? "",
    rua:                  dbPaciente?.endereco_rua         ?? "",
    bairro:               dbPaciente?.endereco_bairro      ?? "",
    cidade:               dbPaciente?.endereco_cidade      ?? "",
    estado:               dbPaciente?.endereco_estado      ?? "",
    cep:                  dbPaciente?.endereco_cep         ?? "",
    como_conheceu:        dbPaciente?.como_conheceu        ?? "",
    dentista_responsavel: dbPaciente?.dentista_responsavel ?? "",
  });

  // Hydrate when DB data loads
  useEffect(() => {
    if (dbPaciente) {
      setForm({
        nome:                 dbPaciente.nome                ?? "",
        cpf:                  dbPaciente.cpf                 ?? "",
        data_nascimento:      dbPaciente.data_nascimento      ?? "",
        telefone:             dbPaciente.telefone             ?? "",
        email:                dbPaciente.email               ?? "",
        rua:                  dbPaciente.endereco_rua         ?? "",
        bairro:               dbPaciente.endereco_bairro      ?? "",
        cidade:               dbPaciente.endereco_cidade      ?? "",
        estado:               dbPaciente.endereco_estado      ?? "",
        cep:                  dbPaciente.endereco_cep         ?? "",
        como_conheceu:        dbPaciente.como_conheceu        ?? "",
        dentista_responsavel: dbPaciente.dentista_responsavel ?? "",
      });
    }
  }, [dbPaciente]);

  const saveMut = useMutation({
    mutationFn: () =>
      updatePaciente(pacienteId, {
        nome:                 form.nome,
        cpf:                  form.cpf               || null,
        data_nascimento:      form.data_nascimento   || null,
        telefone:             form.telefone          || null,
        email:                form.email             || null,
        endereco_rua:         form.rua               || null,
        endereco_bairro:      form.bairro            || null,
        endereco_cidade:      form.cidade            || null,
        endereco_estado:      form.estado            || null,
        endereco_cep:         form.cep               || null,
        como_conheceu:        form.como_conheceu     || null,
        dentista_responsavel: form.dentista_responsavel || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paciente", pacienteId] });
      toast.success("Dados salvos com sucesso!");
    },
    onError: (e: Error) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 bg-[#0C0F1A] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/38 transition-colors";

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value })),
    };
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
            <input {...field("nome")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">CPF</label>
            <input {...field("cpf")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Data de nascimento</label>
            <input type="date" {...field("data_nascimento")} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Telefone</label>
            <input {...field("telefone")} className={inputCls} />
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
            <select {...field("dentista_responsavel")} className={inputCls}>
              <option value="">Selecione o dentista</option>
              {dentistas.map(d => (
                <option key={d.id} value={d.nome}>{d.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Como nos conheceu</label>
            <select {...field("como_conheceu")} className={inputCls}>
              <option value="">Selecione</option>
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
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
          style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.20)" }}
        >
          {saveMut.isPending
            ? <LoaderCircle size={14} className="animate-spin" />
            : <Save size={14} />}
          Salvar alterações
        </button>
      </div>
    </div>
  );
}

/* ─── Tab: Anamnese ─── */
function AnamneseTab({
  pacienteId,
  sexo,
}: {
  pacienteId: string;
  sexo: string;
}) {
  const qc = useQueryClient();

  const { data: dbAnamnese, isLoading } = useQuery({
    queryKey: ["anamnese", pacienteId],
    queryFn:  () => fetchAnamnese(pacienteId),
    enabled:  !!pacienteId,
  });

  const [form, setForm] = useState({
    pressao:      "",
    diabetico:    false,
    cardiopatia:  false,
    hipertensao:  false,
    fumante:      false,
    gravida:      false,
    alergias:     "",
    medicamentos: "",
    cirurgias:    "",
    observacoes:  "",
    lastUpdated:  "—",
  });

  // Hydrate form from DB when data arrives
  useEffect(() => {
    if (dbAnamnese) {
      setForm({
        pressao:      dbAnamnese.pressao_arterial ?? "",
        diabetico:    dbAnamnese.diabetico,
        cardiopatia:  dbAnamnese.cardiopatia,
        hipertensao:  dbAnamnese.hipertensao,
        fumante:      dbAnamnese.fumante,
        gravida:      dbAnamnese.gravida,
        alergias:     dbAnamnese.alergias     ?? "",
        medicamentos: dbAnamnese.medicamentos ?? "",
        cirurgias:    dbAnamnese.cirurgias    ?? "",
        observacoes:  dbAnamnese.observacoes  ?? "",
        lastUpdated:  new Date(dbAnamnese.updated_at).toLocaleDateString("pt-BR"),
      });
    }
  }, [dbAnamnese]);

  const saveMut = useMutation({
    mutationFn: () =>
      upsertAnamnese({
        paciente_id:      pacienteId,
        pressao_arterial: form.pressao     || null,
        diabetico:        form.diabetico,
        cardiopatia:      form.cardiopatia,
        hipertensao:      form.hipertensao,
        fumante:          form.fumante,
        gravida:          form.gravida,
        alergias:         form.alergias    || null,
        medicamentos:     form.medicamentos || null,
        cirurgias:        form.cirurgias   || null,
        observacoes:      form.observacoes || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["anamnese", pacienteId] });
      toast.success("Anamnese salva com sucesso!");
    },
    onError: (e: Error) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  const textareaCls =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 bg-[#0C0F1A] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/38 transition-colors resize-none";

  const healthItems: {
    key: "diabetico" | "cardiopatia" | "hipertensao" | "fumante";
    label: string;
    Icon: React.ElementType;
    iconColor: string;
  }[] = [
    { key: "diabetico",   label: "Diabético(a)", Icon: Activity,   iconColor: "#CA8A04" },
    { key: "cardiopatia", label: "Cardiopatia",  Icon: Heart,      iconColor: "#DC2626" },
    { key: "hipertensao", label: "Hipertensão",  Icon: HeartPulse, iconColor: "#DC2626" },
    { key: "fumante",     label: "Fumante",       Icon: Cigarette,  iconColor: "#9B6DFF" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 rounded-2xl" style={{ background: "#131726" }} />
        ))}
      </div>
    );
  }

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
            <div
              key={key}
              className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
            >
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
          {sexo === "F" && (
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
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
          style={{ background: "#1D9E75", boxShadow: "0 0 16px rgba(29,158,117,0.20)" }}
        >
          {saveMut.isPending
            ? <LoaderCircle size={14} className="animate-spin" />
            : <Save size={14} />}
          Salvar anamnese
        </button>
        <p className="text-xs text-white/28">
          <Clock size={10} className="inline mr-1" />
          Última atualização: {form.lastUpdated}
        </p>
      </div>
    </div>
  );
}

/* ─── Tab: Histórico Clínico ─── */
function HistoricoTab({ pacienteId }: { pacienteId: string }) {
  const [showModal, setShowModal] = useState(false);

  const { data: dbConsultas = [], isLoading } = useQuery({
    queryKey: ["consultas", pacienteId],
    queryFn:  () => fetchConsultas(pacienteId),
    enabled:  !!pacienteId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-64 rounded-2xl" style={{ background: "#131726" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          {dbConsultas.length} consulta{dbConsultas.length !== 1 ? "s" : ""} registrada{dbConsultas.length !== 1 ? "s" : ""}
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

      {/* Empty state */}
      {dbConsultas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.15)" }}
          >
            <ClipboardList size={24} className="text-[#1D9E75]/50" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/50">Nenhuma consulta registrada</p>
            <p className="text-xs text-white/25 mt-1">Clique em &ldquo;Registrar consulta&rdquo; para começar</p>
          </div>
        </div>
      ) : (
        /* Timeline */
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />

          <div className="space-y-4">
            {dbConsultas.map(c => {
              const procColor = "#5B8DEF";
              const dateStr = c.data_consulta
                ? new Date(c.data_consulta + "T12:00:00").toLocaleDateString("pt-BR")
                : "—";

              return (
                <div key={c.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex-none flex flex-col items-center" style={{ width: 40 }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0"
                      style={{
                        background: `${procColor}18`,
                        border: `2px solid ${procColor}55`,
                      }}
                    >
                      <Stethoscope size={14} style={{ color: procColor }} />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 rounded-2xl border border-white/[0.06] overflow-hidden mb-2"
                    style={{ background: "#131726" }}
                  >
                    {/* Card header */}
                    <div
                      className="px-5 py-3 border-b border-white/[0.05] flex items-center gap-3"
                      style={{ borderLeft: `3px solid ${procColor}` }}
                    >
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{ background: `${procColor}18`, color: procColor }}
                      >
                        {c.tipo_consulta ?? "Consulta"}
                      </span>
                      <div className="flex items-center gap-1.5 text-white/40">
                        <Calendar size={11} />
                        <span className="text-xs">{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/40">
                        <User size={11} />
                        <span className="text-xs">{c.dentista_nome ?? "—"}</span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4 space-y-3">
                      {[
                        { label: "Queixa principal",     value: c.queixa_principal,    Icon: FileText     },
                        { label: "Diagnóstico",           value: c.diagnostico,         Icon: ClipboardList },
                        { label: "Tratamento realizado",  value: c.tratamento_realizado, Icon: Stethoscope  },
                        { label: "Prescrição",            value: c.prescricao,          Icon: Pill         },
                        { label: "Próximo passo",         value: c.proximo_passo,       Icon: ArrowRight   },
                      ].filter(r => r.value).map(({ label, value, Icon }) => (
                        <div key={label} className="flex gap-3">
                          <div className="flex-none w-4 mt-0.5">
                            <Icon size={12} className="text-white/25" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/32 uppercase tracking-wider mb-0.5">{label}</p>
                            <p
                              className="text-sm text-white/80 leading-relaxed"
                              style={{ whiteSpace: "pre-line" }}
                            >
                              {value}
                            </p>
                          </div>
                        </div>
                      ))}

                      {c.observacoes && (
                        <div
                          className="flex gap-2 rounded-lg px-3 py-2 mt-1"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                        >
                          <AlertCircle size={12} className="text-white/25 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-white/45 leading-relaxed">{c.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

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
      )}

      {showModal && (
        <RegistrarConsultaModal pacienteId={pacienteId} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

/* ─── Tab: Financeiro ─── */
function FinanceiroTab({ pacienteId }: { pacienteId: string }) {
  const [showNovoTratamento, setShowNovoTratamento] = useState(false);
  const [showPagamento,      setShowPagamento]      = useState(false);

  const { data: tratamentos = [], isLoading: loadingTratamentos } = useQuery({
    queryKey: ["financeiro", pacienteId],
    queryFn:  () => fetchFinanceiroPaciente(pacienteId),
    enabled:  !!pacienteId,
  });

  const { data: parcelas = [], isLoading: loadingParcelas } = useQuery({
    queryKey: ["parcelas", pacienteId],
    queryFn:  () => fetchParcelas(pacienteId),
    enabled:  !!pacienteId,
  });

  const isLoading = loadingTratamentos || loadingParcelas;

  // Computed totals
  const total     = tratamentos.reduce((s, t) => s + t.valor_total, 0);
  const paid      = parcelas.filter(p => p.status === "pago").reduce((s, p) => s + (p.valor_pago ?? p.valor), 0);
  const remaining = Math.max(0, total - paid);
  const paidPct   = total > 0 ? Math.round((paid / total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" style={{ background: "#131726" }} />
        ))}
      </div>
    );
  }

  // Empty state
  if (tratamentos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowNovoTratamento(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "#1D9E75", boxShadow: "0 0 14px rgba(29,158,117,0.20)" }}
          >
            <Plus size={14} />
            Registrar tratamento
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.15)" }}
          >
            <Banknote size={24} className="text-[#1D9E75]/50" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/50">Nenhum tratamento registrado</p>
            <p className="text-xs text-white/25 mt-1">Clique em &ldquo;Registrar tratamento&rdquo; para adicionar</p>
          </div>
        </div>

        {showNovoTratamento && (
          <NovoTratamentoModal pacienteId={pacienteId} onClose={() => setShowNovoTratamento(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Valor total do tratamento", value: fmtBRL(total),     color: "white",   icon: Banknote     },
          { label: "Total pago",                value: fmtBRL(paid),      color: "#1D9E75", icon: CheckCircle2 },
          { label: "Falta pagar",               value: fmtBRL(remaining), color: "#DC2626", icon: AlertCircle  },
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

      {/* Progress bar */}
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
          <span>{fmtBRL(paid)} pagos</span>
          <span>{fmtBRL(remaining)} restantes</span>
        </div>
      </div>

      {/* Parcelas por tratamento */}
      {tratamentos.map(tratamento => {
        const tParcelas    = parcelas.filter(p => p.financeiro_paciente_id === tratamento.id);
        const pagasCont    = tParcelas.filter(p => p.status === "pago").length;

        return (
          <div
            key={tratamento.id}
            className="rounded-2xl border border-white/[0.06] overflow-hidden"
            style={{ background: "#131726" }}
          >
            {/* Treatment header */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-[#1D9E75]" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{tratamento.descricao}</h3>
                  <p className="text-xs text-white/35">
                    {fmtBRL(tratamento.valor_total)} · {tratamento.num_parcelas} parcelas
                  </p>
                </div>
              </div>
              <span className="text-xs text-white/30">
                {pagasCont} de {tParcelas.length} pagas
              </span>
            </div>

            {/* Parcela rows */}
            <div className="divide-y divide-white/[0.04]">
              {tParcelas.map(p => {
                const cfg = PARC_CFG[p.status as ParcStatus] ?? PARC_CFG.pendente;
                const vencDate = new Date(p.vencimento + "T12:00:00").toLocaleDateString("pt-BR");
                const pagDate  = p.data_pagamento
                  ? new Date(p.data_pagamento + "T12:00:00").toLocaleDateString("pt-BR")
                  : null;

                return (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        background: `${cfg.color}18`,
                        color: cfg.color,
                        border: `1.5px solid ${cfg.color}35`,
                      }}
                    >
                      {p.num_parcela}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{fmtBRL(p.valor)}</p>
                      <p className="text-xs text-white/32">
                        Vencimento: {vencDate}
                        {pagDate && ` · Pago em: ${pagDate}`}
                      </p>
                    </div>
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
          </div>
        );
      })}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowPagamento(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: "#1D9E75", boxShadow: "0 0 14px rgba(29,158,117,0.18)" }}
        >
          <CreditCard size={14} />
          Registrar pagamento
        </button>
        <button
          onClick={() => setShowNovoTratamento(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 border border-white/[0.10] hover:text-white hover:border-white/[0.22] transition-all"
        >
          <Plus size={14} />
          Novo tratamento
        </button>
      </div>

      {showNovoTratamento && (
        <NovoTratamentoModal pacienteId={pacienteId} onClose={() => setShowNovoTratamento(false)} />
      )}
      {showPagamento && (
        <RegistrarPagamentoModal
          pacienteId={pacienteId}
          parcelas={parcelas}
          onClose={() => setShowPagamento(false)}
        />
      )}
    </div>
  );
}

/* ─── Main Page ─── */
const TABS: TabType[] = ["Dados Pessoais", "Anamnese", "Histórico Clínico", "Financeiro"];

const TAB_ICONS: Record<TabType, React.ElementType> = {
  "Dados Pessoais":    User,
  "Anamnese":          Heart,
  "Histórico Clínico": ClipboardList,
  "Financeiro":        Banknote,
};

const STATUS_COLOR: Record<string, string> = {
  INADIMPLENTE: "#DC2626",
  ATIVO:        "#1D9E75",
  NOVO:         "#5B8DEF",
  INATIVO:      "#6B7280",
};

export default function ProntuarioPage() {
  const params     = useParams();
  const id         = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("Dados Pessoais");

  const { data: dbPaciente } = useQuery({
    queryKey: ["paciente", id],
    queryFn:  () => fetchPacienteById(id),
    enabled:  !!id,
  });

  const { data: dentistas = [] } = useQuery({
    queryKey: ["dentistas"],
    queryFn:  fetchDentistas,
  });

  const nome       = dbPaciente?.nome ?? "Carregando…";
  const initials   = nome.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const age        = dbPaciente?.data_nascimento
    ? new Date().getFullYear() - new Date(dbPaciente.data_nascimento).getFullYear()
    : null;
  const status     = dbPaciente?.status ?? "";
  const statusColor = STATUS_COLOR[status] ?? "#6B7280";

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />

      <main className="flex-1 ml-16 flex flex-col min-h-screen overflow-hidden">

        {/* ── Topbar ── */}
        <div
          className="flex-none border-b border-white/[0.06] px-6 py-3 flex items-center gap-4"
          style={{ background: "rgba(12,15,26,0.98)" }}
        >
          <Link
            href="/dashboard/pacientes"
            className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Pacientes
          </Link>

          <span className="text-white/20">/</span>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: "#1D9E75" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-base leading-tight truncate">{nome}</h1>
                {status && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${statusColor}18`, color: statusColor }}
                  >
                    {status}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {age !== null && (
                  <span className="text-xs text-white/35">{age} anos</span>
                )}
                {dbPaciente?.telefone && (
                  <>
                    <span className="text-xs text-white/20">·</span>
                    <span className="text-xs text-white/35 flex items-center gap-1">
                      <Phone size={10} />
                      {dbPaciente.telefone}
                    </span>
                  </>
                )}
                {dbPaciente?.tratamento && (
                  <>
                    <span className="text-xs text-white/20">·</span>
                    <span className="text-xs text-white/35 flex items-center gap-1">
                      <Stethoscope size={10} />
                      {dbPaciente.tratamento}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {dbPaciente?.cpf && (
            <div
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs text-white/35 border border-white/[0.06]"
              style={{ background: "#131726" }}
            >
              CPF {dbPaciente.cpf}
            </div>
          )}
        </div>

        {/* ── Tab bar ── */}
        <div
          className="flex-none border-b border-white/[0.06] px-6 flex items-end gap-1"
          style={{ background: "rgba(12,15,26,0.95)" }}
        >
          {TABS.map(tab => {
            const Icon   = TAB_ICONS[tab];
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all"
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
          {activeTab === "Dados Pessoais"   && (
            <DadosPessoaisTab
              pacienteId={id}
              dbPaciente={dbPaciente}
              dentistas={dentistas}
            />
          )}
          {activeTab === "Anamnese"          && (
            <AnamneseTab pacienteId={id} sexo={dbPaciente?.sexo ?? "M"} />
          )}
          {activeTab === "Histórico Clínico" && <HistoricoTab pacienteId={id} />}
          {activeTab === "Financeiro"        && <FinanceiroTab pacienteId={id} />}
        </div>

      </main>
    </div>
  );
}
