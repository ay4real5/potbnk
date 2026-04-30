# potbnk

Full-stack banking app with FastAPI plus React/Vite, deployed as a single Vercel project with Supabase.

## Current Architecture

- Frontend: Vite build output from frontend/dist.
- Backend: FastAPI served by Vercel Python function at api/index.py.
- Database and auth provider: Supabase.
- API path from browser: /api/*.

## Required Environment Variables

Set these in Vercel Project Settings -> Environment Variables for Production, Preview, and Development.

Backend variables:

- DATABASE_URL
- SECRET_KEY
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY

Frontend variables:

- VITE_API_URL with value /api
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

Security rule:

- Never expose SUPABASE_SERVICE_ROLE_KEY to browser code.

## Deploy On Vercel

1. Import this repository as a Vercel project.
2. Set root directory to repository root (do not set to frontend).
3. Confirm Vercel reads vercel.json from root.
4. Add all environment variables listed above.
5. Deploy.
6. Redeploy whenever environment variables change.

## How Routing Works

- Requests to /api/* are rewritten to api/index.py.
- All other routes serve the SPA and fallback to index.html.
- Frontend axios client defaults to /api if no explicit API URL is set.

## Verify Deployment

1. Open your deployed app URL.
2. Register or log in.
3. Open browser devtools and confirm API calls go to /api/...
4. Call GET /api/health and expect {"status":"healthy"}.
5. Call authenticated GET /api/integrations/supabase/status and expect status ok.

## Local Development

- Use Docker Compose for local full-stack runs.
- Backend reads local variables from app/.env.
- Frontend local .env can point VITE_API_URL to http://localhost:8000 when running backend directly.
