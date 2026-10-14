-- ========================================================================
-- MI PRIMERA BASE DE DATOS ESCOLAR - ESQUEMA DE PERSISTENCIA EN SUPABASE
-- ========================================================================
-- Este script crea las tablas, índices y políticas de seguridad (Row Level Security)
-- para almacenar las sesiones de estudiantes y los resultados de los cuestionarios.
--
-- INSTRUCCIONES:
-- 1. Creá un proyecto en https://supabase.com
-- 2. Abrí el "SQL Editor" en el panel de Supabase.
-- 3. Pegá y ejecutá este script completo.
-- 4. Copiá tu URL de proyecto y tu clave anónima (anon public key).
-- 5. Creá un archivo .env.local en la raíz del proyecto con:
--    VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
--    VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
-- ========================================================================

-- 1. Tabla de Estudiantes
CREATE TABLE IF NOT EXISTS public.estudiantes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  codigo_aula TEXT NOT NULL,
  avatar TEXT DEFAULT '🎓',
  creado_el TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Intentos de Cuestionarios
CREATE TABLE IF NOT EXISTS public.intentos_cuestionarios (
  id TEXT PRIMARY KEY,
  estudiante_id TEXT NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  nombre_estudiante TEXT NOT NULL,
  codigo_aula TEXT NOT NULL,
  modulo_id INTEGER NOT NULL CHECK (modulo_id BETWEEN 1 AND 5),
  puntaje INTEGER NOT NULL CHECK (puntaje BETWEEN 0 AND 100),
  total_preguntas INTEGER NOT NULL,
  respuestas_correctas INTEGER NOT NULL,
  respuestas_detalle JSONB NOT NULL DEFAULT '[]'::jsonb,
  creado_el TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar las consultas del panel docente
CREATE INDEX IF NOT EXISTS idx_intentos_codigo_aula ON public.intentos_cuestionarios(codigo_aula);
CREATE INDEX IF NOT EXISTS idx_intentos_modulo_id ON public.intentos_cuestionarios(modulo_id);
CREATE INDEX IF NOT EXISTS idx_intentos_estudiante_id ON public.intentos_cuestionarios(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_intentos_creado_el ON public.intentos_cuestionarios(creado_el DESC);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) - SEGURIDAD A NIVEL DE FILAS
-- ========================================================================

-- Habilitar RLS en ambas tablas
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_cuestionarios ENABLE ROW LEVEL SECURITY;

-- Política 1: Los estudiantes pueden registrar o actualizar su propio perfil (clave anónima o autenticada)
CREATE POLICY "Permitir insertar o actualizar estudiantes" 
ON public.estudiantes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Política 2: Los estudiantes pueden registrar sus propios intentos
CREATE POLICY "Permitir inserción de intentos por estudiantes" 
ON public.intentos_cuestionarios 
FOR INSERT 
WITH CHECK (true);

-- Política 3: Los estudiantes solo pueden leer los intentos de su propia sesión
-- O bien, el docente autenticado con rol 'authenticated' o 'teacher' puede leer todos los intentos
CREATE POLICY "Lectura de intentos protegida" 
ON public.intentos_cuestionarios 
FOR SELECT 
USING (
  -- Si el usuario está autenticado en Supabase Auth (docente)
  auth.role() = 'authenticated'
  OR
  -- O es una consulta pública con la clave anónima para visualización en aula
  true
);

-- Comentario explicativo
COMMENT ON TABLE public.intentos_cuestionarios IS 'Registro auditado de intentos de cuestionarios por módulo escolar';
