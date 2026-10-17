CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS content_documents (id text PRIMARY KEY, payload jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS quote_requests (id uuid PRIMARY KEY, business text NOT NULL, email text NOT NULL, modules jsonb NOT NULL, goal text NOT NULL, consent_at timestamptz NOT NULL, status text NOT NULL DEFAULT 'new', external_client_id text, external_quote_id text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS integration_events (id bigserial PRIMARY KEY, quote_id uuid REFERENCES quote_requests(id), provider text NOT NULL, status text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
