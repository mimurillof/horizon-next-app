-- Script SQL para crear las tablas del esquema Horizon Investment Hub
-- Ejecutar en Supabase SQL Editor

-- Crear ENUMs (tipos personalizados)
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE money_purpose_enum AS ENUM ('retirement', 'house_purchase', 'education', 'long_term_growth', 'passive_income', 'other');
CREATE TYPE time_horizon_enum AS ENUM ('short_term_trader', 'long_term_holder');
CREATE TYPE risk_reaction_enum AS ENUM ('high_aversion', 'moderate_aversion', 'moderate_tolerance', 'high_tolerance');

-- 1. Tabla USERS (sincronizada con Supabase Auth)
CREATE TABLE users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT 'handled_by_supabase_auth', -- Solo referencia
    birth_date DATE,
    gender gender_enum,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla PORTFOLIOS
CREATE TABLE portfolios (
    portfolio_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    portfolio_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla ASSETS
CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    portfolio_id INTEGER NOT NULL REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    asset_symbol VARCHAR(20) NOT NULL,
    quantity NUMERIC(20, 8) NOT NULL CHECK (quantity > 0),
    acquisition_price NUMERIC(20, 2) NOT NULL CHECK (acquisition_price > 0),
    acquisition_date DATE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla RISK_ASSESSMENTS
CREATE TABLE risk_assessments (
    assessment_id SERIAL PRIMARY KEY,
    portfolio_id INTEGER NOT NULL REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    purpose money_purpose_enum NOT NULL,
    time_horizon time_horizon_enum NOT NULL,
    risk_reaction risk_reaction_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_assets_portfolio_id ON assets(portfolio_id);
CREATE INDEX idx_assets_symbol ON assets(asset_symbol);
CREATE INDEX idx_risk_assessments_portfolio_id ON risk_assessments(portfolio_id);
CREATE INDEX idx_users_email ON users(email);

-- Habilitar Row Level Security (RLS) para Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (ajustar según necesidades de seguridad)
-- Los usuarios solo pueden ver/editar sus propios datos

-- Política para users: solo el propio usuario puede ver/editar su perfil
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para portfolios: solo el propietario puede ver/editar sus portafolios
CREATE POLICY "Users can view own portfolios" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolios" ON portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolios" ON portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolios" ON portfolios FOR DELETE USING (auth.uid() = user_id);

-- Política para assets: solo a través del portafolio del usuario
CREATE POLICY "Users can view own assets" ON assets FOR SELECT USING (
    portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE auth.uid() = user_id)
);
CREATE POLICY "Users can insert own assets" ON assets FOR INSERT WITH CHECK (
    portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE auth.uid() = user_id)
);
CREATE POLICY "Users can update own assets" ON assets FOR UPDATE USING (
    portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE auth.uid() = user_id)
);
CREATE POLICY "Users can delete own assets" ON assets FOR DELETE USING (
    portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE auth.uid() = user_id)
);

-- Política para risk_assessments: solo a través del portafolio del usuario
CREATE POLICY "Users can view own risk assessments" ON risk_assessments FOR SELECT USING (
    portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE auth.uid() = user_id)
);
CREATE POLICY "Users can insert own risk assessments" ON risk_assessments FOR INSERT WITH CHECK (
    portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE auth.uid() = user_id)
);
CREATE POLICY "Users can update own risk assessments" ON risk_assessments FOR UPDATE USING (
    portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE auth.uid() = user_id)
);
CREATE POLICY "Users can delete own risk assessments" ON risk_assessments FOR DELETE USING (
    portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE auth.uid() = user_id)
);

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE portfolios IS 'Portafolios de inversión de los usuarios';
COMMENT ON TABLE assets IS 'Activos financieros dentro de cada portafolio';
COMMENT ON TABLE risk_assessments IS 'Evaluaciones de riesgo asociadas a cada portafolio';

COMMENT ON COLUMN users.user_id IS 'Identificador único del usuario';
COMMENT ON COLUMN users.email IS 'Email único del usuario para login';
COMMENT ON COLUMN portfolios.user_id IS 'Referencia al propietario del portafolio';
COMMENT ON COLUMN assets.portfolio_id IS 'Referencia al portafolio que contiene este activo';
COMMENT ON COLUMN assets.asset_symbol IS 'Símbolo del activo (ej: AAPL, BTC)';
COMMENT ON COLUMN assets.quantity IS 'Cantidad de unidades del activo';
COMMENT ON COLUMN assets.acquisition_price IS 'Precio total de adquisición';
COMMENT ON COLUMN risk_assessments.portfolio_id IS 'Referencia al portafolio evaluado';