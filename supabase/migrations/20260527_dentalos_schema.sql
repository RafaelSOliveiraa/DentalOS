-- DentalOS — schema inicial
-- Execute no SQL Editor do Supabase Dashboard

-- ───────────────────────────────────────────────
-- 1. DENTISTAS
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dentistas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT NOT NULL,
  crm            TEXT,
  especialidade  TEXT,
  email          TEXT,
  telefone       TEXT,
  cor            TEXT NOT NULL DEFAULT '#1D9E75',
  ativo          BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed dentistas
INSERT INTO dentistas (nome, crm, especialidade, email, telefone, cor, ativo) VALUES
  ('Dra. Ana Paula', 'CRO-SP 45231', 'Implantodontia',  'ana.paula@dentalos.com.br', '(11) 98000-0001', '#1D9E75', true),
  ('Dr. Bruno',      'CRO-SP 38102', 'Ortodontia',      'bruno@dentalos.com.br',     '(11) 98000-0002', '#9B6DFF', true),
  ('Dra. Carla',     'CRO-SP 52874', 'Dentística',      'carla@dentalos.com.br',     '(11) 98000-0003', '#5B8DEF', true)
ON CONFLICT DO NOTHING;

-- ───────────────────────────────────────────────
-- 2. PACIENTES
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacientes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome              TEXT NOT NULL,
  cpf               TEXT,
  data_nascimento   DATE,
  telefone          TEXT,
  email             TEXT,
  sexo              TEXT NOT NULL DEFAULT 'N',  -- M | F | N
  endereco_rua      TEXT,
  endereco_bairro   TEXT,
  endereco_cidade   TEXT,
  endereco_estado   TEXT,
  endereco_cep      TEXT,
  como_conheceu     TEXT,
  dentista_id       UUID REFERENCES dentistas(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'ATIVO',  -- ATIVO | INADIMPLENTE | NOVO | INATIVO
  tratamento        TEXT,
  balance           NUMERIC NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pacientes_nome_idx ON pacientes USING gin(to_tsvector('portuguese', nome));

-- ───────────────────────────────────────────────
-- 3. ANAMNESES
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anamneses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id      UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  pressao_arterial TEXT,
  diabetico        BOOLEAN NOT NULL DEFAULT false,
  cardiopatia      BOOLEAN NOT NULL DEFAULT false,
  hipertensao      BOOLEAN NOT NULL DEFAULT false,
  fumante          BOOLEAN NOT NULL DEFAULT false,
  gravida          BOOLEAN NOT NULL DEFAULT false,
  alergias         TEXT,
  medicamentos     TEXT,
  cirurgias        TEXT,
  observacoes      TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (paciente_id)
);

-- ───────────────────────────────────────────────
-- 4. AGENDAMENTOS
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agendamentos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id      UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  dentista_id      UUID REFERENCES dentistas(id) ON DELETE SET NULL,
  data             DATE NOT NULL,
  hora_inicio      TIME NOT NULL,
  hora_fim         TIME NOT NULL,
  procedimento     TEXT,
  status           TEXT NOT NULL DEFAULT 'nao_confirmado',  -- confirmado | nao_confirmado
  observacoes      TEXT,
  is_novo_paciente BOOLEAN NOT NULL DEFAULT false,
  is_break         BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agendamentos_data_idx ON agendamentos (data);
CREATE INDEX IF NOT EXISTS agendamentos_dentista_idx ON agendamentos (dentista_id, data);

-- ───────────────────────────────────────────────
-- 5. CONSULTAS (histórico clínico)
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consultas (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id          UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id          UUID REFERENCES dentistas(id) ON DELETE SET NULL,
  data                 DATE NOT NULL,
  queixa               TEXT,
  exame_clinico        TEXT,
  diagnostico          TEXT,
  tratamento_realizado TEXT,
  prescricao           TEXT,
  proximo_passo        TEXT,
  observacoes          TEXT,
  procedimento         TEXT,
  proc_color           TEXT NOT NULL DEFAULT '#5B8DEF',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS consultas_paciente_idx ON consultas (paciente_id, data DESC);

-- ───────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (habilitar depois de validar)
-- ───────────────────────────────────────────────
-- ALTER TABLE dentistas   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pacientes   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE anamneses   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultas   ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "authenticated_all" ON dentistas   FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "authenticated_all" ON pacientes   FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "authenticated_all" ON anamneses   FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "authenticated_all" ON agendamentos FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "authenticated_all" ON consultas   FOR ALL USING (auth.role() = 'authenticated');
