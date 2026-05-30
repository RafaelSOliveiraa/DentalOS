"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Settings, Users, Plus, X, Pencil, Save,
  LoaderCircle, Stethoscope, Mail, Phone,
  CheckCheck, Palette,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  fetchDentistas,
  createDentista,
  updateDentista,
} from "@/lib/queries";
import type { DentistaRow } from "@/lib/supabase";

/* ─── Types ─── */
type DentistForm = {
  nome: string;
  crm: string;
  especialidade: string;
  email: string;
  telefone: string;
  cor: string;
  ativo: boolean;
};

const EMPTY_FORM: DentistForm = {
  nome: "",
  crm: "",
  especialidade: "",
  email: "",
  telefone: "",
  cor: "#1D9E75",
  ativo: true,
};

const COR_PRESETS = [
  "#1D9E75", "#5B8DEF", "#9B6DFF", "#EF9F27",
  "#DC2626", "#0891B2", "#CA8A04", "#EA580C",
];

/* ─── Dentist modal ─── */
function DentistaModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial?: DentistaRow;
  onClose: () => void;
  onSave: (form: DentistForm) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<DentistForm>(
    initial
      ? {
          nome: initial.nome,
          crm: initial.crm ?? "",
          especialidade: initial.especialidade ?? "",
          email: initial.email ?? "",
          telefone: initial.telefone ?? "",
          cor: initial.cor,
          ativo: initial.ativo,
        }
      : EMPTY_FORM
  );

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 bg-[#0C0F1A] border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/38 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.08] overflow-hidden"
        style={{ background: "#131726" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${form.cor}18` }}
            >
              <Stethoscope size={15} style={{ color: form.cor }} />
            </div>
            <h2 className="text-white font-bold text-base">
              {initial ? "Editar dentista" : "Novo dentista"}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Nome completo *</label>
            <input
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Dra. Ana Paula"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/38 mb-1.5 block">CRM</label>
              <input
                value={form.crm}
                onChange={e => setForm(f => ({ ...f, crm: e.target.value }))}
                placeholder="CRO-SP 00000"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-white/38 mb-1.5 block">Especialidade</label>
              <input
                value={form.especialidade}
                onChange={e => setForm(f => ({ ...f, especialidade: e.target.value }))}
                placeholder="Ex: Ortodontia"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/38 mb-1.5 block">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="dentista@clinica.com.br"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs text-white/38 mb-1.5 block">Telefone</label>
            <input
              value={form.telefone}
              onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
              placeholder="(11) 99999-0000"
              className={inputCls}
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="text-xs text-white/38 mb-2 block flex items-center gap-1.5">
              <Palette size={11} />
              Cor na agenda
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COR_PRESETS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, cor: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{
                    background: c,
                    outline: form.cor === c ? `2px solid white` : "none",
                    outlineOffset: 2,
                    transform: form.cor === c ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
              <div className="flex items-center gap-2 ml-1">
                <input
                  type="color"
                  value={form.cor}
                  onChange={e => setForm(f => ({ ...f, cor: e.target.value }))}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent"
                  title="Cor personalizada"
                />
                <span className="text-xs text-white/30 font-mono">{form.cor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm text-white/55 border border-white/[0.08] hover:border-white/20 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.nome.trim() || saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:brightness-110"
            style={{ background: "#1D9E75" }}
          >
            {saving ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {initial ? "Salvar alterações" : "Criar dentista"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Dentista row card ─── */
function DentistaCard({
  dentista,
  onEdit,
  onToggle,
  togglingId,
}: {
  dentista: DentistaRow;
  onEdit: (d: DentistaRow) => void;
  onToggle: (d: DentistaRow) => void;
  togglingId: string | null;
}) {
  const isToggling = togglingId === dentista.id;

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5 flex items-center gap-4 transition-all"
      style={{
        background: "#131726",
        opacity: dentista.ativo ? 1 : 0.55,
      }}
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{
          background: `${dentista.cor}20`,
          border: `2px solid ${dentista.cor}45`,
          color: dentista.cor,
        }}
      >
        {dentista.nome
          .split(" ")
          .filter(w => w !== "Dra." && w !== "Dr.")
          .slice(0, 2)
          .map(w => w[0])
          .join("")
          .toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-white font-semibold text-sm truncate">{dentista.nome}</h3>
          {!dentista.ativo && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white/40 bg-white/[0.06]">
              Inativo
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {dentista.crm && (
            <span className="text-xs text-white/35 font-mono">{dentista.crm}</span>
          )}
          {dentista.especialidade && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{ background: `${dentista.cor}14`, color: dentista.cor }}
            >
              {dentista.especialidade}
            </span>
          )}
          {dentista.email && (
            <span className="text-xs text-white/30 flex items-center gap-1 hidden md:flex">
              <Mail size={10} />
              {dentista.email}
            </span>
          )}
          {dentista.telefone && (
            <span className="text-xs text-white/30 flex items-center gap-1">
              <Phone size={10} />
              {dentista.telefone}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Ativo toggle */}
        <button
          onClick={() => onToggle(dentista)}
          disabled={isToggling}
          className="relative w-10 h-6 rounded-full transition-all disabled:opacity-60"
          style={{ background: dentista.ativo ? "#1D9E75" : "rgba(255,255,255,0.12)" }}
          title={dentista.ativo ? "Desativar" : "Ativar"}
        >
          {isToggling ? (
            <LoaderCircle
              size={12}
              className="animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
            />
          ) : (
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: dentista.ativo ? "calc(100% - 22px)" : "2px" }}
            />
          )}
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(dentista)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:border-[#1D9E75]/40 hover:text-[#1D9E75]"
          style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
        >
          <Pencil size={11} />
          Editar
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ConfiguracoesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<DentistaRow | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  /* Query */
  const { data: dentistas = [], isLoading, isError } = useQuery({
    queryKey: ["dentistas"],
    queryFn: fetchDentistas,
  });

  /* Create mutation */
  const createMut = useMutation({
    mutationFn: (form: DentistForm) =>
      createDentista({ ...form, crm: form.crm || null, especialidade: form.especialidade || null, email: form.email || null, telefone: form.telefone || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dentistas"] });
      toast.success("Dentista criado com sucesso!");
      setShowModal(false);
    },
    onError: (e: Error) => toast.error(`Erro ao criar: ${e.message}`),
  });

  /* Update mutation */
  const updateMut = useMutation({
    mutationFn: ({ id, form }: { id: string; form: DentistForm }) =>
      updateDentista(id, { ...form, crm: form.crm || null, especialidade: form.especialidade || null, email: form.email || null, telefone: form.telefone || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dentistas"] });
      toast.success("Dentista atualizado com sucesso!");
      setEditTarget(null);
    },
    onError: (e: Error) => toast.error(`Erro ao atualizar: ${e.message}`),
  });

  /* Toggle mutation */
  const toggleMut = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      updateDentista(id, { ativo }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["dentistas"] });
      toast.success(vars.ativo ? "Dentista ativado." : "Dentista desativado.");
      setTogglingId(null);
    },
    onError: (e: Error) => {
      toast.error(`Erro: ${e.message}`);
      setTogglingId(null);
    },
  });

  function handleToggle(d: DentistaRow) {
    setTogglingId(d.id);
    toggleMut.mutate({ id: d.id, ativo: !d.ativo });
  }

  function handleSaveNew(form: DentistForm) {
    createMut.mutate(form);
  }

  function handleSaveEdit(form: DentistForm) {
    if (!editTarget) return;
    updateMut.mutate({ id: editTarget.id, form });
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />

      <main className="flex-1 ml-16 overflow-y-auto">

        {/* Topbar */}
        <div
          className="sticky top-0 z-20 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between"
          style={{ background: "rgba(12,15,26,0.98)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(29,158,117,0.12)" }}
            >
              <Settings size={18} className="text-[#1D9E75]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Configurações</h1>
              <p className="text-white/40 text-xs">Gerencie dentistas e configurações da clínica</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6 max-w-3xl">

          {/* ── Dentistas ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#1D9E75]" />
                <h2 className="text-white font-bold text-base">Dentistas</h2>
                {!isLoading && (
                  <span className="text-xs text-white/35 ml-1">
                    {dentistas.filter(d => d.ativo).length} ativo{dentistas.filter(d => d.ativo).length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{ background: "#1D9E75", boxShadow: "0 0 14px rgba(29,158,117,0.22)" }}
              >
                <Plus size={14} />
                Novo dentista
              </button>
            </div>

            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-2xl border border-white/[0.06] p-5 flex items-center gap-4" style={{ background: "#131726" }}>
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="w-20 h-8 rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {isError && (
              <div
                className="rounded-2xl border border-[#DC2626]/25 p-5 text-center"
                style={{ background: "rgba(220,38,38,0.06)" }}
              >
                <p className="text-sm text-[#DC2626]">Erro ao carregar dentistas.</p>
                <p className="text-xs text-white/35 mt-1">
                  Verifique as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local
                </p>
              </div>
            )}

            {!isLoading && !isError && dentistas.length === 0 && (
              <div
                className="rounded-2xl border border-white/[0.06] p-10 text-center"
                style={{ background: "#131726" }}
              >
                <Users size={28} className="text-white/15 mx-auto mb-3" />
                <p className="text-sm text-white/35">Nenhum dentista cadastrado</p>
                <p className="text-xs text-white/22 mt-1">Clique em "Novo dentista" para começar</p>
              </div>
            )}

            {!isLoading && !isError && dentistas.length > 0 && (
              <div className="space-y-3">
                {dentistas.map(d => (
                  <DentistaCard
                    key={d.id}
                    dentista={d}
                    onEdit={setEditTarget}
                    onToggle={handleToggle}
                    togglingId={togglingId}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Informações da clínica (placeholder) ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Settings size={16} className="text-white/40" />
              <h2 className="text-white/60 font-bold text-base">Clínica</h2>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-medium ml-1"
                style={{ background: "rgba(91,141,239,0.12)", color: "#5B8DEF" }}
              >
                em breve
              </span>
            </div>
            <div
              className="rounded-2xl border border-white/[0.04] p-5 text-center opacity-40"
              style={{ background: "#131726" }}
            >
              <p className="text-sm text-white/40">
                Nome da clínica, endereço, logo e horário de funcionamento
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <DentistaModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveNew}
          saving={createMut.isPending}
        />
      )}
      {editTarget && (
        <DentistaModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
          saving={updateMut.isPending}
        />
      )}
    </div>
  );
}
