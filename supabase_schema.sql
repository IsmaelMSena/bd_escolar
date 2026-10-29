-- ========================================================================
-- MI PRIMERA BASE DE DATOS ESCOLAR - ESQUEMA CENTRALIZADO EN SUPABASE
-- AUDITORÍA DE SEGURIDAD Y EVALUACIÓN CENTRALIZADA (MÓDULOS 1 A 4)
-- ========================================================================
-- Este script implementa la arquitectura de seguridad requerida:
-- 1. Tablas seguras: docentes, estudiantes, claves_respuestas, sesiones_examenes e intentos_examenes.
-- 2. Claves de respuesta aisladas en el servidor PostgreSQL (inaccesibles por REST API para alumnos).
-- 3. Funciones SECURITY DEFINER con search_path explícito:
--    - es_docente(): verifica rol docente mediante Supabase Auth y tabla docentes.
--    - registrar_estudiante(): vincula y valida perfil escolar con token criptográfico (SHA-256).
--    - iniciar_examen(): registra y controla la sesión y tiempo de inicio oficial (40 min).
--    - entregar_examen(): valida identidad, previene duplicación con bloqueos FOR UPDATE,
--                        califica en el servidor con nota certificada e idempotencia total.
-- 4. Row Level Security (RLS) estricto: ningún alumno puede leer calificaciones ajenas.
-- 5. Carga de las 80 claves oficiales auditadas (Módulos 1 a 4).
-- ========================================================================

-- Extensión criptográfica para funciones de hash y UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- 1. TABLA DE DOCENTES AUTORIZADOS
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.docentes (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.docentes IS 'Registro de profesores autorizados para consultar exámenes y calificaciones escolares';

-- ========================================================================
-- 2. TABLA DE ESTUDIANTES CON TOKEN CRIPTOGRÁFICO
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.estudiantes (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  codigo_aula TEXT NOT NULL,
  avatar TEXT DEFAULT '🎓',
  creado_el TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  ultima_actividad TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_estudiantes_codigo_aula ON public.estudiantes(codigo_aula);
CREATE INDEX IF NOT EXISTS idx_estudiantes_token_hash ON public.estudiantes(token_hash);

COMMENT ON TABLE public.estudiantes IS 'Estudiantes registrados. El token_hash (SHA-256) previene la suplantación de identidad';

-- ========================================================================
-- 3. BANCO DE CLAVES MAESTRAS DE EXÁMENES (MÓDULOS 1 A 4)
-- PROTEGIDO: NINGÚN ALUMNO TIENE PERMISO SELECT DIRECTO SOBRE ESTA TABLA
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.claves_respuestas (
  pregunta_id TEXT PRIMARY KEY,
  modulo_id INTEGER NOT NULL CHECK (modulo_id BETWEEN 1 AND 4),
  opcion_correcta_index INTEGER NOT NULL CHECK (opcion_correcta_index BETWEEN 0 AND 2),
  explicacion TEXT,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_claves_modulo_id ON public.claves_respuestas(modulo_id);

COMMENT ON TABLE public.claves_respuestas IS 'Respuestas oficiales de examen; solo accesibles por la función RPC entregar_examen';

-- ========================================================================
-- 4. SESIONES OFICIALES DE EXÁMENES (TEMPORIZADOR Y CONTROL)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.sesiones_examenes (
  id TEXT PRIMARY KEY,
  estudiante_id TEXT NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  modulo_id INTEGER NOT NULL CHECK (modulo_id BETWEEN 1 AND 4),
  inicio_el TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  limite_segundos INTEGER NOT NULL DEFAULT 2400, -- 40 minutos
  estado TEXT NOT NULL DEFAULT 'en_curso' CHECK (estado IN ('en_curso', 'completado', 'caducado')),
  actualizado_el TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_sesiones_estudiante_modulo ON public.sesiones_examenes(estudiante_id, modulo_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_estado ON public.sesiones_examenes(estado);

-- ========================================================================
-- 5. INTENTOS Y RESULTADOS DE EXÁMENES (CALIFICACIONES OFICIALES)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.intentos_examenes (
  id TEXT PRIMARY KEY,
  sesion_id TEXT NOT NULL REFERENCES public.sesiones_examenes(id) ON DELETE CASCADE,
  estudiante_id TEXT NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  nombre_estudiante TEXT NOT NULL,
  codigo_aula TEXT NOT NULL,
  modulo_id INTEGER NOT NULL CHECK (modulo_id BETWEEN 1 AND 4),
  nombre_modulo TEXT NOT NULL,
  inicio_el TIMESTAMPTZ NOT NULL,
  finalizo_el TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  duracion_segundos INTEGER NOT NULL CHECK (duracion_segundos >= 0),
  limite_segundos INTEGER NOT NULL DEFAULT 2400,
  estado TEXT NOT NULL DEFAULT 'completed' CHECK (estado IN ('completed', 'interrupted')),
  motivo_finalizacion TEXT NOT NULL CHECK (motivo_finalizacion IN ('voluntary', 'timeout')),
  total_preguntas INTEGER NOT NULL DEFAULT 20 CHECK (total_preguntas = 20),
  preguntas_respondidas INTEGER NOT NULL CHECK (preguntas_respondidas BETWEEN 0 AND 20),
  respuestas_correctas INTEGER NOT NULL CHECK (respuestas_correctas BETWEEN 0 AND 20),
  respuestas_incorrectas INTEGER NOT NULL CHECK (respuestas_incorrectas BETWEEN 0 AND 20),
  sin_responder INTEGER NOT NULL CHECK (sin_responder BETWEEN 0 AND 20),
  puntaje_porcentaje INTEGER NOT NULL CHECK (puntaje_porcentaje BETWEEN 0 AND 100),
  aprobado BOOLEAN NOT NULL,
  numero_intento INTEGER NOT NULL CHECK (numero_intento >= 1),
  respuestas_detalle JSONB NOT NULL DEFAULT '[]'::jsonb,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_intento_sesion UNIQUE (sesion_id)
);

CREATE INDEX IF NOT EXISTS idx_intentos_ex_aula ON public.intentos_examenes(codigo_aula);
CREATE INDEX IF NOT EXISTS idx_intentos_ex_modulo ON public.intentos_examenes(modulo_id);
CREATE INDEX IF NOT EXISTS idx_intentos_ex_estudiante ON public.intentos_examenes(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_intentos_ex_inicio ON public.intentos_examenes(inicio_el DESC);

-- ========================================================================
-- 6. TABLA DE INTENTOS DE CUESTIONARIOS RÁPIDOS DE PRÁCTICA
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.intentos_cuestionarios (
  id TEXT PRIMARY KEY,
  estudiante_id TEXT NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  nombre_estudiante TEXT NOT NULL,
  codigo_aula TEXT NOT NULL,
  modulo_id INTEGER NOT NULL CHECK (modulo_id BETWEEN 1 AND 10),
  puntaje INTEGER NOT NULL CHECK (puntaje BETWEEN 0 AND 100),
  total_preguntas INTEGER NOT NULL,
  respuestas_correctas INTEGER NOT NULL,
  respuestas_detalle JSONB NOT NULL DEFAULT '[]'::jsonb,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_intentos_q_aula ON public.intentos_cuestionarios(codigo_aula);
CREATE INDEX IF NOT EXISTS idx_intentos_q_modulo ON public.intentos_cuestionarios(modulo_id);

-- ========================================================================
-- 7. FUNCIÓN HELPER: VALIDACIÓN DE DOCENTE AUTORIZADO
-- ========================================================================
CREATE OR REPLACE FUNCTION public.es_docente()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.docentes 
    WHERE id = auth.uid() 
      AND activo = true
  );
$$;

-- ========================================================================
-- 8. FUNCIÓN RPC: REGISTRO Y VINCULACIÓN DE ESTUDIANTE
-- ========================================================================
CREATE OR REPLACE FUNCTION public.registrar_estudiante(
  p_id TEXT,
  p_token TEXT,
  p_nombre TEXT,
  p_codigo_aula TEXT,
  p_avatar TEXT DEFAULT '🎓'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash TEXT;
  v_existente RECORD;
BEGIN
  -- Validaciones básicas de entrada
  IF p_id IS NULL OR length(p_id) < 5 THEN
    RAISE EXCEPTION 'ID de estudiante inválido';
  END IF;
  IF p_token IS NULL OR length(p_token) < 8 THEN
    RAISE EXCEPTION 'Token de estudiante inseguro o inválido';
  END IF;
  IF trim(p_nombre) = '' OR length(trim(p_nombre)) < 2 THEN
    RAISE EXCEPTION 'El nombre del estudiante debe contener al menos 2 caracteres';
  END IF;
  IF trim(p_codigo_aula) = '' THEN
    RAISE EXCEPTION 'El código de aula no puede estar vacío';
  END IF;

  v_hash := encode(digest(p_token, 'sha256'), 'hex');

  SELECT id, token_hash INTO v_existente 
  FROM public.estudiantes 
  WHERE id = p_id;

  IF FOUND THEN
    -- Si el estudiante existe, validar que el token provisto coincida con el hash
    IF v_existente.token_hash <> v_hash THEN
      RAISE EXCEPTION 'UNAUTHORIZED: El token no coincide con el perfil del estudiante';
    END IF;

    UPDATE public.estudiantes
    SET nombre = trim(p_nombre),
        codigo_aula = trim(upper(p_codigo_aula)),
        avatar = COALESCE(p_avatar, '🎓'),
        ultima_actividad = timezone('utc', now())
    WHERE id = p_id;
  ELSE
    INSERT INTO public.estudiantes (id, token_hash, nombre, codigo_aula, avatar, creado_el, ultima_actividad)
    VALUES (
      p_id, 
      v_hash, 
      trim(p_nombre), 
      trim(upper(p_codigo_aula)), 
      COALESCE(p_avatar, '🎓'), 
      timezone('utc', now()), 
      timezone('utc', now())
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'estudiante_id', p_id,
    'nombre', trim(p_nombre),
    'codigo_aula', trim(upper(p_codigo_aula))
  );
END;
$$;

-- ========================================================================
-- 9. FUNCIÓN RPC: INICIAR SESIÓN DE EXAMEN EN EL SERVIDOR
-- ========================================================================
CREATE OR REPLACE FUNCTION public.iniciar_examen(
  p_sesion_id TEXT,
  p_estudiante_id TEXT,
  p_token TEXT,
  p_modulo_id INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash TEXT;
  v_estudiante RECORD;
  v_sesion_existente RECORD;
BEGIN
  IF p_modulo_id < 1 OR p_modulo_id > 4 THEN
    RAISE EXCEPTION 'Módulo inválido. Solo se admiten módulos 1 a 4.';
  END IF;

  v_hash := encode(digest(p_token, 'sha256'), 'hex');

  SELECT id, token_hash INTO v_estudiante
  FROM public.estudiantes
  WHERE id = p_estudiante_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estudiante no registrado. Debe iniciar sesión primero.';
  END IF;

  IF v_estudiante.token_hash <> v_hash THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Token de estudiante inválido.';
  END IF;

  SELECT id, estudiante_id, modulo_id, inicio_el, limite_segundos, estado
  INTO v_sesion_existente
  FROM public.sesiones_examenes
  WHERE id = p_sesion_id;

  IF FOUND THEN
    IF v_sesion_existente.estudiante_id <> p_estudiante_id OR v_sesion_existente.modulo_id <> p_modulo_id THEN
      RAISE EXCEPTION 'CONFLICT: El identificador de sesión pertenece a otro alumno o módulo.';
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'sesion_id', v_sesion_existente.id,
      'inicio_el', v_sesion_existente.inicio_el,
      'limite_segundos', v_sesion_existente.limite_segundos,
      'estado', v_sesion_existente.estado
    );
  END IF;

  INSERT INTO public.sesiones_examenes (
    id, estudiante_id, modulo_id, inicio_el, limite_segundos, estado, actualizado_el
  ) VALUES (
    p_sesion_id, p_estudiante_id, p_modulo_id, timezone('utc', now()), 2400, 'en_curso', timezone('utc', now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'sesion_id', p_sesion_id,
    'inicio_el', timezone('utc', now()),
    'limite_segundos', 2400,
    'estado', 'en_curso'
  );
END;
$$;

-- ========================================================================
-- 10. FUNCIÓN RPC: ENTREGAR Y CERTIFICAR EXAMEN EN EL SERVIDOR
-- EVALUACIÓN TOTALMENTE AUTORITARIA EN POSTGRESQL (SIN FILTRACIÓN DE CLAVES)
-- ========================================================================
CREATE OR REPLACE FUNCTION public.entregar_examen(
  p_intento_id TEXT,
  p_sesion_id TEXT,
  p_estudiante_id TEXT,
  p_token TEXT,
  p_modulo_id INTEGER,
  p_motivo TEXT,
  p_respuestas_enviadas JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash TEXT;
  v_estudiante RECORD;
  v_sesion RECORD;
  v_intento_existente RECORD;
  v_segundos_transcurridos INTEGER;
  v_duracion_final INTEGER;
  v_motivo_final TEXT;
  v_nombre_modulo TEXT;
  v_total_preguntas INTEGER := 20;
  v_claves_count INTEGER;
  v_correctas INTEGER := 0;
  v_respondidas INTEGER := 0;
  v_incorrectas INTEGER := 0;
  v_sin_responder INTEGER := 0;
  v_puntaje_porcentaje INTEGER;
  v_aprobado BOOLEAN;
  v_num_intento INTEGER;
  v_r RECORD;
  v_seleccionada_obj JSONB;
  v_sel_idx INTEGER;
BEGIN
  -- 1. Validar identidad y token del estudiante ANTES de cualquier operación
  IF p_token IS NULL OR length(p_token) < 8 THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Token de estudiante inválido';
  END IF;

  v_hash := encode(digest(p_token, 'sha256'), 'hex');

  -- Bloqueo FOR UPDATE sobre el estudiante para serializar entregas concurrentes
  SELECT id, nombre, codigo_aula, token_hash 
  INTO v_estudiante
  FROM public.estudiantes
  WHERE id = p_estudiante_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Estudiante no encontrado';
  END IF;

  IF v_estudiante.token_hash <> v_hash THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Token inválido para este estudiante';
  END IF;

  -- 2. Idempotencia: si el intento ya fue registrado, verificar propiedad y devolverlo
  SELECT id, estudiante_id, puntaje_porcentaje, aprobado, respuestas_correctas, 
         respuestas_incorrectas, sin_responder, duracion_segundos, numero_intento
  INTO v_intento_existente
  FROM public.intentos_examenes
  WHERE id = p_intento_id;

  IF FOUND THEN
    IF v_intento_existente.estudiante_id <> p_estudiante_id THEN
      RAISE EXCEPTION 'CONFLICT: Este intento pertenece a otro estudiante';
    END IF;

    RETURN jsonb_build_object(
      'intento_id', v_intento_existente.id,
      'estudiante_id', v_intento_existente.estudiante_id,
      'modulo_id', p_modulo_id,
      'puntaje_porcentaje', v_intento_existente.puntaje_porcentaje,
      'aprobado', v_intento_existente.aprobado,
      'respuestas_correctas', v_intento_existente.respuestas_correctas,
      'respuestas_incorrectas', v_intento_existente.respuestas_incorrectas,
      'sin_responder', v_intento_existente.sin_responder,
      'duracion_segundos', v_intento_existente.duracion_segundos,
      'numero_intento', v_intento_existente.numero_intento,
      'mensaje', 'Intento recuperado con éxito (idempotente)'
    );
  END IF;

  -- 3. Validar y bloquear la sesión de examen
  SELECT id, estudiante_id, modulo_id, inicio_el, limite_segundos, estado
  INTO v_sesion
  FROM public.sesiones_examenes
  WHERE id = p_sesion_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sesión de examen no encontrada';
  END IF;

  IF v_sesion.estudiante_id <> p_estudiante_id OR v_sesion.modulo_id <> p_modulo_id THEN
    RAISE EXCEPTION 'CONFLICT: La sesión no coincide con el estudiante o módulo indicado';
  END IF;

  IF v_sesion.estado = 'completado' THEN
    RAISE EXCEPTION 'ALREADY_COMPLETED: Esta sesión de examen ya fue entregada anteriormente';
  END IF;

  -- 4. Cálculo seguro de tiempo y tolerancia del servidor
  v_segundos_transcurridos := GREATEST(1, EXTRACT(EPOCH FROM (timezone('utc', now()) - v_sesion.inicio_el))::INTEGER);

  -- Regla de vencimiento: 40 min (2400 s) + 3 min de tolerancia de entrega de red (2580 s)
  IF v_segundos_transcurridos > 2580 THEN
    v_motivo_final := 'timeout';
    v_duracion_final := 2400; -- Se fija el máximo oficial
  ELSE
    v_motivo_final := CASE WHEN p_motivo = 'timeout' THEN 'timeout' ELSE 'voluntary' END;
    v_duracion_final := LEAST(2400, v_segundos_transcurridos);
  END IF;

  -- 5. Nombre oficial de módulo establecido exclusivamente por el servidor
  v_nombre_modulo := CASE p_modulo_id
    WHEN 1 THEN '¿Qué es una base de datos y cómo modela la realidad?'
    WHEN 2 THEN 'Conocer las tablas: Registros, Campos y Tipos de Datos'
    WHEN 3 THEN 'Claves Primarias y Foráneas: La Columna Vertebral'
    WHEN 4 THEN 'Relaciones entre Tablas: 1 a N y N a M'
    ELSE 'Módulo ' || p_modulo_id
  END;

  -- 6. Verificar que existan exactamente 20 claves maestras cargadas para este módulo
  SELECT COUNT(*) INTO v_claves_count
  FROM public.claves_respuestas
  WHERE modulo_id = p_modulo_id;

  IF v_claves_count <> 20 THEN
    RAISE EXCEPTION 'Configuración incompleta: el módulo % debe contener exactamente 20 claves registradas (encontradas: %)', p_modulo_id, v_claves_count;
  END IF;

  -- 7. Calificar de forma autoritaria comparando contra las claves secretas
  FOR v_r IN 
    SELECT pregunta_id, opcion_correcta_index 
    FROM public.claves_respuestas 
    WHERE modulo_id = p_modulo_id 
    ORDER BY pregunta_id ASC
  LOOP
    v_sel_idx := -1;

    -- Buscar si el estudiante respondió esta pregunta
    SELECT (elem->>'selectedOptionIndex')::INTEGER INTO v_sel_idx
    FROM jsonb_array_elements(COALESCE(p_respuestas_enviadas, '[]'::jsonb)) AS elem
    WHERE elem->>'questionId' = v_r.pregunta_id
    LIMIT 1;

    IF v_sel_idx IS NOT NULL AND v_sel_idx >= 0 AND v_sel_idx <= 2 THEN
      v_respondidas := v_respondidas + 1;
      IF v_sel_idx = v_r.opcion_correcta_index THEN
        v_correctas := v_correctas + 1;
      ELSE
        v_incorrectas := v_incorrectas + 1;
      END IF;
    ELSE
      v_sin_responder := v_sin_responder + 1;
    END IF;
  END LOOP;

  -- 8. Cálculo de nota y criterio de aprobación del 70%
  v_puntaje_porcentaje := ROUND((v_correctas * 100.0) / v_total_preguntas);
  v_aprobado := (v_puntaje_porcentaje >= 70);

  -- 9. Asignar número de intento consecutivo atómico protegido por el FOR UPDATE previo
  SELECT COUNT(*) + 1 INTO v_num_intento
  FROM public.intentos_examenes
  WHERE estudiante_id = p_estudiante_id 
    AND modulo_id = p_modulo_id;

  -- 10. Insertar el intento oficial certificado
  INSERT INTO public.intentos_examenes (
    id,
    sesion_id,
    estudiante_id,
    nombre_estudiante,
    codigo_aula,
    modulo_id,
    nombre_modulo,
    inicio_el,
    finalizo_el,
    duracion_segundos,
    limite_segundos,
    estado,
    motivo_finalizacion,
    total_preguntas,
    preguntas_respondidas,
    respuestas_correctas,
    respuestas_incorrectas,
    sin_responder,
    puntaje_porcentaje,
    aprobado,
    numero_intento,
    respuestas_detalle,
    creado_el
  ) VALUES (
    p_intento_id,
    p_sesion_id,
    p_estudiante_id,
    v_estudiante.nombre,
    v_estudiante.codigo_aula,
    p_modulo_id,
    v_nombre_modulo,
    v_sesion.inicio_el,
    timezone('utc', now()),
    v_duracion_final,
    2400,
    'completed',
    v_motivo_final,
    v_total_preguntas,
    v_respondidas,
    v_correctas,
    v_incorrectas,
    v_sin_responder,
    v_puntaje_porcentaje,
    v_aprobado,
    v_num_intento,
    COALESCE(p_respuestas_enviadas, '[]'::jsonb),
    timezone('utc', now())
  );

  -- 11. Actualizar estado de la sesión de examen a completado
  UPDATE public.sesiones_examenes
  SET estado = 'completado',
      actualizado_el = timezone('utc', now())
  WHERE id = p_sesion_id;

  -- 12. Devolver resumen certificado (NUNCA incluir correctOptionIndex de las claves)
  RETURN jsonb_build_object(
    'intento_id', p_intento_id,
    'estudiante_id', p_estudiante_id,
    'modulo_id', p_modulo_id,
    'puntaje_porcentaje', v_puntaje_porcentaje,
    'aprobado', v_aprobado,
    'respuestas_correctas', v_correctas,
    'respuestas_incorrectas', v_incorrectas,
    'sin_responder', v_sin_responder,
    'duracion_segundos', v_duracion_final,
    'numero_intento', v_num_intento,
    'motivo_finalizacion', v_motivo_final
  );
END;
$$;

-- ========================================================================
-- 11. PRIVILEGIOS Y POLÍTICAS ROW LEVEL SECURITY (RLS)
-- PROTECCIÓN RIGUROSA CONTRA ACCESOS INDEBIDOS
-- ========================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claves_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_cuestionarios ENABLE ROW LEVEL SECURITY;

-- Revocar accesos por defecto a PUBLIC y anon
REVOKE ALL ON TABLE public.docentes FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.claves_respuestas FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.sesiones_examenes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.intentos_examenes FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.estudiantes FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.intentos_cuestionarios FROM PUBLIC, anon;

-- Permisos mínimos para authenticated (docentes)
GRANT SELECT ON TABLE public.docentes TO authenticated;
GRANT SELECT ON TABLE public.estudiantes TO authenticated;
GRANT SELECT, DELETE ON TABLE public.intentos_examenes TO authenticated;
GRANT SELECT, DELETE ON TABLE public.intentos_cuestionarios TO authenticated;

-- Permisos de ejecución de RPCs
GRANT EXECUTE ON FUNCTION public.es_docente() TO authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_estudiante(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.iniciar_examen(TEXT, TEXT, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.entregar_examen(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, JSONB) TO anon, authenticated;

-- Políticas RLS sobre DOCENTES
DROP POLICY IF EXISTS "Docentes pueden consultar su propio registro" ON public.docentes;
CREATE POLICY "Docentes pueden consultar su propio registro"
ON public.docentes
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Políticas RLS sobre ESTUDIANTES
DROP POLICY IF EXISTS "Docentes autorizados pueden consultar estudiantes" ON public.estudiantes;
CREATE POLICY "Docentes autorizados pueden consultar estudiantes"
ON public.estudiantes
FOR SELECT
TO authenticated
USING (public.es_docente());

-- Políticas RLS sobre INTENTOS_EXAMENES
DROP POLICY IF EXISTS "Docentes autorizados pueden consultar intentos de examen" ON public.intentos_examenes;
CREATE POLICY "Docentes autorizados pueden consultar intentos de examen"
ON public.intentos_examenes
FOR SELECT
TO authenticated
USING (public.es_docente());

DROP POLICY IF EXISTS "Docentes autorizados pueden eliminar intentos de examen" ON public.intentos_examenes;
CREATE POLICY "Docentes autorizados pueden eliminar intentos de examen"
ON public.intentos_examenes
FOR DELETE
TO authenticated
USING (public.es_docente());

-- Políticas RLS sobre INTENTOS_CUESTIONARIOS
DROP POLICY IF EXISTS "Docentes autorizados pueden consultar cuestionarios" ON public.intentos_cuestionarios;
CREATE POLICY "Docentes autorizados pueden consultar cuestionarios"
ON public.intentos_cuestionarios
FOR SELECT
TO authenticated
USING (public.es_docente());

DROP POLICY IF EXISTS "Docentes autorizados pueden eliminar cuestionarios" ON public.intentos_cuestionarios;
CREATE POLICY "Docentes autorizados pueden eliminar cuestionarios"
ON public.intentos_cuestionarios
FOR DELETE
TO authenticated
USING (public.es_docente());

-- Inserción de cuestionarios permitida mediante inserción directa
GRANT INSERT ON TABLE public.intentos_cuestionarios TO anon, authenticated;
DROP POLICY IF EXISTS "Permitir insertar cuestionarios" ON public.intentos_cuestionarios;
CREATE POLICY "Permitir insertar cuestionarios"
ON public.intentos_cuestionarios
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ========================================================================
-- 12. BANCO MAESTRO DE CLAVES OFICIALES (80 PREGUNTAS: MÓDULOS 1 A 4)
-- VERIFICADO Y AUDITADO AL 100% CONTRA src/data/examsData.ts
-- Distribución equilibrada por módulo: 7 opción A (0), 7 opción B (1), 6 opción C (2)
-- ========================================================================

DELETE FROM public.claves_respuestas;

INSERT INTO public.claves_respuestas (pregunta_id, modulo_id, opcion_correcta_index, explicacion) VALUES
('e1_q01', 1, 0, 'Una base de datos es un sistema estructurado para almacenar, gestionar y recuperar información digital de forma segura y eficiente.'),
('e1_q02', 1, 1, 'Cada fila horizontal completa representa un registro (o tupla) que reúne todos los datos de una misma entidad.'),
('e1_q03', 1, 2, 'Las columnas verticales se denominan campos o atributos y definen qué característica se guarda en esa posición para cada registro.'),
('e1_q04', 1, 0, 'La intersección entre una fila (registro) y una columna (campo) contiene un único valor de información denominado celda o dato.'),
('e1_q05', 1, 1, 'Tener todo en una sola tabla provoca repetir cursos y preceptores en cada fila de alumno, generando inconsistencias si alguien modifica un valor en un lugar y no en otro.'),
('e1_q06', 1, 2, 'Al separar los datos en tablas temáticas, modificar el nombre del curso en su propia tabla actualiza la información para todo el sistema sin duplicaciones.'),
('e1_q07', 1, 0, 'La consistencia asegura que los datos sean coherentes, exactos y sin discrepancias a lo largo de toda la base.'),
('e1_q08', 1, 1, '"ana@escuela.com" es el contenido puntual de una celda específica correspondiente al campo email de un registro.'),
('e1_q09', 1, 2, 'Cada celda debe contener un valor atómico (indivisible). Poner listas de texto impide ordenar, filtrar y consultar materias eficientemente.'),
('e1_q10', 1, 0, 'MySQL es uno de los motores relacionales (RDBMS) más utilizados en el mundo y el estándar que empleamos en el curso.'),
('e1_q11', 1, 1, 'El SGBD es el software intermediario que gestiona el almacenamiento, la seguridad, la concurrencia y la ejecución de instrucciones en la base de datos.'),
('e1_q12', 1, 2, 'Guardar el mismo dato con formatos divergentes dificulta la búsqueda automática y genera inconsistencias.'),
('e1_q13', 1, 0, 'El principio de diseño modular establece que cada tabla almacena información de una sola entidad conceptual.'),
('e1_q14', 1, 1, 'La cantidad de registros equivale directamente a la cantidad de filas horizontales de datos (25 profesores).'),
('e1_q15', 1, 2, 'Las bases de datos digitales permiten realizar copias de seguridad periódicas, replicación y planes de contingencia.'),
('e1_q16', 1, 0, 'Un dato elemental compone un campo; los campos de una entidad forman un registro; los registros forman una tabla; y el conjunto de tablas forma la base de datos.'),
('e1_q17', 1, 1, 'Aunque ambas muestran cuadrículas, los motores de bases de datos relacionales garantizan seguridad transaccional, integridad de relaciones y escalabilidad que una hoja de cálculo no posee.'),
('e1_q18', 1, 2, 'Sin gestión de concurrencia y transacciones, dos modificaciones simultáneas pueden pisarse mutuamente.'),
('e1_q19', 1, 0, 'Los Alumnos constituyen una entidad real y central de la escuela con múltiples propiedades a registrar (nombre, apellido, email).'),
('e1_q20', 1, 1, 'La base de datos relacional es el estándar indispensable para organizar la gestión escolar de forma segura, confiable y escalable.'),
('e2_q01', 2, 0, 'La tabla Cursos define el identificador id_curso, el nombre de la división (ej. "1 A") y el año lectivo (ej. 1).'),
('e2_q02', 2, 1, 'La tabla Alumnos almacena los datos personales: id_alumno, nombre, apellido y email.'),
('e2_q03', 2, 2, 'La tabla Inscripciones vincula un estudiante (id_alumno) con su curso asignado (id_curso) indicando la fecha.'),
('e2_q04', 2, 0, 'Los identificadores numéricos correlativos se definen con el tipo de dato INT.'),
('e2_q05', 2, 1, 'VARCHAR permite almacenar texto alfanumérico con un límite máximo de caracteres.'),
('e2_q06', 2, 2, 'El estándar ISO y de MySQL para campos DATE es Año-Mes-Día (AAAA-MM-DD).'),
('e2_q07', 2, 0, '"López" es el valor asignado a la columna apellido en ese registro.'),
('e2_q08', 2, 1, 'La tabla Materias es el catálogo maestro con el listado de todas las asignaturas de la escuela.'),
('e2_q09', 2, 2, 'Separar Alumnos de Cursos a través de Inscripciones evita la redundancia y facilita el mantenimiento de los datos.'),
('e2_q10', 2, 0, 'El valor 3 en id_alumno hace referencia a la fila correspondiente de la tabla Alumnos.'),
('e2_q11', 2, 1, 'NOT NULL obliga a que cada nuevo registro tenga un valor explícito en esa columna, impidiendo datos incompletos.'),
('e2_q12', 2, 2, 'El teléfono del tutor es una propiedad vinculada a cada alumno, por lo que pertenece a la tabla Alumnos.'),
('e2_q13', 2, 0, 'Tiene 2 columnas verticales (campos: id_materia y nombre) y 3 filas horizontales (registros).'),
('e2_q14', 2, 1, 'Los motores de bases de datos imponen la regla estricta de tipos: no se puede guardar texto en un campo numérico INT.'),
('e2_q15', 2, 2, 'Permite llevar una trazabilidad temporal de cuándo ocurrió la inscripción del estudiante.'),
('e2_q16', 2, 0, 'El campo anio permite filtrar y ordenar los cursos por nivel educativo de forma numérica.'),
('e2_q17', 2, 1, 'Es una cadena de texto que respeta la estructura de un correo electrónico válido.'),
('e2_q18', 2, 2, 'Crear una nueva división simplemente requiere insertar un nuevo registro en la tabla Cursos.'),
('e2_q19', 2, 0, 'Inscribir requiere vincular quién se inscribe (id_alumno) con qué división cursa (id_curso) y la fecha.'),
('e2_q20', 2, 1, 'Se llama relacional porque estructura la información en tablas conectadas lógicamente entre sí mediante claves.'),
('e3_q01', 3, 0, 'La clave primaria identifica de forma exclusiva a cada fila, impidiendo duplicados en la tabla.'),
('e3_q02', 3, 1, 'La regla de entidad de las bases de datos exige que una PK sea única y jamás contenga un valor nulo (NOT NULL).'),
('e3_q03', 3, 2, 'La clave primaria id_alumno garantiza que cada estudiante sea unívocamente identificable aunque compartan nombres.'),
('e3_q04', 3, 0, 'Una clave foránea es una columna que establece el vínculo con otra tabla al referenciar su clave primaria.'),
('e3_q05', 3, 1, 'id_inscripcion identifica de forma exclusiva a cada fila de inscripción.'),
('e3_q06', 3, 2, 'Ambos campos son claves foráneas que aseguran que el alumno y el curso existan en sus tablas de origen.'),
('e3_q07', 3, 0, 'La integridad referencial garantiza la coherencia entre tablas, evitando claves foráneas que apunten a la nada.'),
('e3_q08', 3, 1, 'La restricción FOREIGN KEY bloquea la operación porque el valor 999 no existe en la tabla referenciada Cursos.'),
('e3_q09', 3, 2, 'Un registro huérfano es aquel cuya FK apunta a un valor inexistente en la tabla principal.'),
('e3_q10', 3, 0, 'Los nombres no garantizan unicidad ni estabilidad temporal; por eso se prefieren identificadores numéricos.'),
('e3_q11', 3, 1, 'AUTO_INCREMENT delega en el motor la generación secuencial y sin huecos del próximo identificador único.'),
('e3_q12', 3, 2, 'Cada tabla tiene exactamente una sola clave primaria; si abarca múltiples columnas se denomina clave primaria compuesta.'),
('e3_q13', 3, 0, 'Una tabla puede contener múltiples claves foráneas apuntando a distintas tablas principales.'),
('e3_q14', 3, 1, 'La relación parte del campo foráneo que contiene el valor hacia la clave primaria de destino.'),
('e3_q15', 3, 2, 'La restricción de clave foránea impide borrar el registro padre mientras existan registros hijos que lo referencien.'),
('e3_q16', 3, 0, 'Una PK compuesta combina dos o más atributos (por ejemplo: id_curso e id_materia en Curso_Materia) para formar un par único.'),
('e3_q17', 3, 1, 'MySQL prohíbe duplicar el valor de la clave primaria y genera el error "Duplicate entry for key PRIMARY".'),
('e3_q18', 3, 2, 'Para establecer una relación válida, el campo FK debe tener un tipo de dato compatible con la PK referenciada.'),
('e3_q19', 3, 0, 'La clave foránea no tiene restricción de unicidad; un alumno puede aparecer en múltiples registros de calificaciones.'),
('e3_q20', 3, 1, 'Las claves primarias y foráneas son el pilar de la integridad, exactitud y coherencia de los datos en cualquier base relacional.'),
('e4_q01', 4, 0, 'La relación es de 1 a N: la división (1) alberga a múltiples estudiantes (N).'),
('e4_q02', 4, 1, 'Un curso tiene varias asignaturas (Matemática, Historia, etc.) y Matemática se dicta en varios cursos (1.º A, 1.º B, etc.).'),
('e4_q03', 4, 2, 'Las relaciones N:M se normalizan mediante una tabla intermedia que almacena los pares de claves foráneas.'),
('e4_q04', 4, 0, 'La tabla intermedia se denomina convencionalmente Curso_Materia y reúne id_curso con id_materia.'),
('e4_q05', 4, 1, 'La combinación de (id_curso, id_materia) es única para cada asignación de materia a un curso.'),
('e4_q06', 4, 2, 'Cada fila de Curso_Materia asocia un par numérico: (1, 1).'),
('e4_q07', 4, 0, 'Al ser (id_curso, id_materia) la clave primaria compuesta, no se puede duplicar la misma asignación.'),
('e4_q08', 4, 1, 'La cardinalidad especifica la proporción cuantitativa de la relación entre dos entidades.'),
('e4_q09', 4, 2, 'A cada alumno le corresponde un único legajo oficial y cada legajo pertenece a un único alumno.'),
('e4_q10', 4, 0, 'En las relaciones 1:N, la clave foránea siempre se ubica del lado del "Muchos" para apuntar al registro "Uno".'),
('e4_q11', 4, 1, 'El producto de 3 cursos por 3 materias da un máximo posible de 9 asignaciones.'),
('e4_q12', 4, 2, 'El diseño normalizado con tabla intermedia es flexible y escalable ante cualquier cambio en el plan de estudios.'),
('e4_q13', 4, 0, 'Curso_Materia tiene dos FKs: una apunta a Cursos y la otra apunta a Materias.'),
('e4_q14', 4, 1, 'Poner id_curso en Materias limitaría cada materia a un solo curso (1:N), imposibilitando que Matemática se dicte en 1.º A, 1.º B y 2.º A.'),
('e4_q15', 4, 2, 'La integridad referencial exige dar de baja primero las asignaciones intermedias que dependían de esa materia.'),
('e4_q16', 4, 0, 'La pata de gallo (crow''s foot) o la letra N/M simbolizan el extremo con cardinalidad múltiple.'),
('e4_q17', 4, 1, 'La base de datos conecta las tablas en cadena: Alumnos → Inscripciones → Cursos → Curso_Materia → Materias.'),
('e4_q18', 4, 2, 'Es una relación N:M típica que se resuelve mediante la tabla intermedia Préstamos.'),
('e4_q19', 4, 0, 'Sin claves foráneas no hay integridad referencial; los errores de tipeo y desfasajes corromperían las relaciones.'),
('e4_q20', 4, 1, 'Las relaciones 1:N y N:M con tablas intermedias permiten modelar sistemas complejos del mundo real de manera elegante, segura y sin redundancia.')
ON CONFLICT (pregunta_id) DO UPDATE SET
  modulo_id = EXCLUDED.modulo_id,
  opcion_correcta_index = EXCLUDED.opcion_correcta_index,
  explicacion = EXCLUDED.explicacion;
