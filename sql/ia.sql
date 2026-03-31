-- =====================================================
-- ASISTENTE IA — SchoolNet (Tilata_Next)
-- Script de creación de tablas
-- Ejecutar en: Supabase SQL Editor
-- =====================================================

-- 1. Habilitar extensión pgvector (si no está activa)
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 2. TABLA: ai_config
-- Configuración del asistente (identidad, parámetros RAG)
-- Patrón tomado de ie_module_config
-- =====================================================
CREATE TABLE public.ai_config (
  config_id uuid NOT NULL DEFAULT gen_random_uuid(),
  config_key character varying NOT NULL UNIQUE,
  config_value text NOT NULL,
  config_description text,
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_config_pkey PRIMARY KEY (config_id),
  CONSTRAINT ai_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(user_id)
);

-- Registros iniciales
INSERT INTO public.ai_config (config_key, config_value, config_description) VALUES
  ('base_knowledge', '', 'Documento de identidad organizacional (Capa Base). Se incluye en cada consulta al asistente.'),
  ('similarity_threshold', '0.2', 'Umbral mínimo de similitud para incluir fragmentos en el contexto (0 a 1).'),
  ('match_count', '10', 'Número máximo de fragmentos que devuelve la búsqueda semántica.'),
  ('claude_model', 'claude-sonnet-4-20250514', 'Modelo de Claude a usar para generar respuestas.');

-- =====================================================
-- 3. TABLA: ai_documents
-- Documentos subidos por administradores
-- =====================================================
CREATE TABLE public.ai_documents (
  document_id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_name character varying NOT NULL,
  document_description text,
  original_filename character varying NOT NULL,
  file_type character varying NOT NULL CHECK (file_type::text = ANY (ARRAY['pdf','docx','txt','md'])),
  file_size integer NOT NULL,
  storage_path character varying NOT NULL,
  chunks_count integer DEFAULT 0,
  document_status character varying DEFAULT 'processing'::character varying CHECK (document_status::text = ANY (ARRAY['processing'::character varying::text, 'ready'::character varying::text, 'error'::character varying::text])),
  document_version integer DEFAULT 1,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_documents_pkey PRIMARY KEY (document_id),
  CONSTRAINT ai_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id)
);

-- =====================================================
-- 4. TABLA: ai_document_chunks
-- Fragmentos de documentos con embeddings para RAG
-- =====================================================
CREATE TABLE public.ai_document_chunks (
  chunk_id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  chunk_index integer NOT NULL,
  chunk_title text,
  chunk_content text NOT NULL,
  embedding vector(1024),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_document_chunks_pkey PRIMARY KEY (chunk_id),
  CONSTRAINT ai_document_chunks_document_fkey FOREIGN KEY (document_id) REFERENCES public.ai_documents(document_id) ON DELETE CASCADE
);

-- Índice para búsqueda semántica (IVFFlat)
CREATE INDEX ai_document_chunks_embedding_idx
  ON public.ai_document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- =====================================================
-- 5. TABLA: ai_chat_sessions
-- Conversaciones de usuarios con el asistente
-- =====================================================
CREATE TABLE public.ai_chat_sessions (
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_title character varying,
  session_status character varying DEFAULT 'active'::character varying CHECK (session_status::text = ANY (ARRAY['active'::character varying::text, 'closed'::character varying::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_chat_sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT ai_chat_sessions_user_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

-- =====================================================
-- 6. TABLA: ai_chat_messages
-- Mensajes individuales (usuario y asistente)
-- =====================================================
CREATE TABLE public.ai_chat_messages (
  message_id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  message_role character varying NOT NULL CHECK (message_role::text = ANY (ARRAY['user'::character varying::text, 'assistant'::character varying::text])),
  message_content text NOT NULL,
  tokens_input integer,
  tokens_output integer,
  chunks_used uuid[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_chat_messages_pkey PRIMARY KEY (message_id),
  CONSTRAINT ai_chat_messages_session_fkey FOREIGN KEY (session_id) REFERENCES public.ai_chat_sessions(session_id) ON DELETE CASCADE
);

-- =====================================================
-- 7. FUNCIÓN: match_ai_document_chunks
-- Búsqueda semántica de fragmentos relevantes
-- =====================================================
CREATE OR REPLACE FUNCTION match_ai_document_chunks(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  title text,
  content text,
  document_name character varying,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.chunk_id AS id,
    dc.document_id,
    dc.chunk_title AS title,
    dc.chunk_content AS content,
    d.document_name,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.ai_document_chunks dc
  JOIN public.ai_documents d ON d.document_id = dc.document_id
  WHERE dc.embedding IS NOT NULL
    AND d.document_status = 'ready'
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- =====================================================
-- 8. VISTA: ai_usage_monthly
-- Estadísticas de uso mensual (para monitoreo)
-- =====================================================
CREATE OR REPLACE VIEW public.ai_usage_monthly AS
SELECT
  date_trunc('month', m.created_at)::date AS month,
  COUNT(DISTINCT s.session_id) AS total_sessions,
  COUNT(m.message_id) AS total_messages,
  COALESCE(SUM(m.tokens_input), 0) AS total_tokens_input,
  COALESCE(SUM(m.tokens_output), 0) AS total_tokens_output,
  (SELECT COUNT(*) FROM public.ai_documents WHERE document_status = 'ready') AS total_documents,
  ROUND(
    (COALESCE(SUM(m.tokens_input), 0) * 3.0 / 1000000) +
    (COALESCE(SUM(m.tokens_output), 0) * 15.0 / 1000000),
    4
  ) AS estimated_cost_usd
FROM public.ai_chat_messages m
JOIN public.ai_chat_sessions s ON s.session_id = m.session_id
WHERE m.message_role = 'assistant'
GROUP BY date_trunc('month', m.created_at)
ORDER BY month DESC;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
