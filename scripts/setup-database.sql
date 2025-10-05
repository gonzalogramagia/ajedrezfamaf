-- Crear tabla de posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de torneos
CREATE TABLE IF NOT EXISTS chess_tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  max_players INTEGER NOT NULL DEFAULT 32,
  system TEXT NOT NULL DEFAULT 'Suizo',
  time_per_player INTEGER NOT NULL DEFAULT 15,
  time_increment INTEGER NOT NULL DEFAULT 10,
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  location TEXT NOT NULL,
  prizes TEXT,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de jugadores
CREATE TABLE IF NOT EXISTS chess_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  chess_level TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de inscripciones
CREATE TABLE IF NOT EXISTS chess_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES chess_tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES chess_players(id) ON DELETE CASCADE,
  discount_code TEXT,
  final_price DECIMAL(10,2) NOT NULL,
  payment_committed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, player_id)
);

-- Crear tabla de partidas
CREATE TABLE IF NOT EXISTS chess_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES chess_tournaments(id) ON DELETE CASCADE,
  player1_id UUID REFERENCES chess_players(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES chess_players(id) ON DELETE CASCADE,
  result TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('player1_wins', 'player2_wins', 'draw', 'pending')),
  moves TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON chess_tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON chess_tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON chess_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_player ON chess_registrations(player_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON chess_matches(tournament_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON chess_tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON chess_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON chess_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON chess_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_matches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para acceso público a lectura
CREATE POLICY "Posts are publicly readable" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Tournaments are publicly readable" ON chess_tournaments
    FOR SELECT USING (true);

CREATE POLICY "Players are publicly readable" ON chess_players
    FOR SELECT USING (true);

CREATE POLICY "Registrations are publicly readable" ON chess_registrations
    FOR SELECT USING (true);

CREATE POLICY "Matches are publicly readable" ON chess_matches
    FOR SELECT USING (true);

-- Políticas RLS para inscripciones públicas
CREATE POLICY "Anyone can register for tournaments" ON chess_registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create player profiles" ON chess_players
    FOR INSERT WITH CHECK (true);

-- Función para actualizar contador de jugadores en torneos
CREATE OR REPLACE FUNCTION update_tournament_player_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar contador cuando se inserta o elimina una inscripción
    IF TG_OP = 'INSERT' THEN
        UPDATE chess_tournaments 
        SET updated_at = NOW()
        WHERE id = NEW.tournament_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE chess_tournaments 
        SET updated_at = NOW()
        WHERE id = OLD.tournament_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para actualizar contador de jugadores
CREATE TRIGGER update_tournament_player_count_trigger
    AFTER INSERT OR DELETE ON chess_registrations
    FOR EACH ROW EXECUTE FUNCTION update_tournament_player_count();
