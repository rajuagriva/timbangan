-- Create locations master table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200),
  category VARCHAR(20) NOT NULL CHECK (category IN ('internal', 'plasma', 'external')),
  
  -- GPS and Geography
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  area_hectares DECIMAL(10, 2),
  distance_to_factory_km DECIMAL(10, 2),
  
  -- Management
  pic_mandor_name VARCHAR(100),
  pic_contact VARCHAR(50),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Create index for performance
CREATE INDEX idx_locations_code ON public.locations(code);
CREATE INDEX idx_locations_category ON public.locations(category);
CREATE INDEX idx_locations_active ON public.locations(is_active);

-- Create location history table for audit trail
CREATE TABLE IF NOT EXISTS public.location_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  changed_field VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(100),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_location_history_location_id ON public.location_history(location_id);
CREATE INDEX idx_location_history_changed_at ON public.location_history(changed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users - adjust based on your auth setup)
CREATE POLICY "Enable read access for all users" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.locations FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.locations FOR DELETE USING (true);

CREATE POLICY "Enable read access for location history" ON public.location_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for location history" ON public.location_history FOR INSERT WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.locations IS 'Master data for all supply locations (Afdeling, Plasma, Third-Party)';
COMMENT ON TABLE public.location_history IS 'Audit trail for location data changes';
