-- Create patients table for storing patient information and analysis
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  contact_info TEXT,
  symptoms TEXT NOT NULL,
  diagnosis TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view all patients (for simplicity in this medical app)
CREATE POLICY "Allow public read access" ON public.patients
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert patients
CREATE POLICY "Allow public insert access" ON public.patients
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster name searches
CREATE INDEX idx_patients_name ON public.patients(name);
CREATE INDEX idx_patients_created_at ON public.patients(created_at DESC);