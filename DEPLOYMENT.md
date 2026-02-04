# Deployment & Admin Workflow

## 1. Deploying to Vercel

You can deploy the application directly from your terminal using the Vercel CLI.

### Prerequisites
- Ensure you are logged in: `vercel login`
- Ensure your project is linked: `vercel link` (follow the prompts, usually selecting the existing project)

### Deploy Command
To deploy to production:
```bash
vercel --prod
```

### Environment Variables
Ensure the following variables are set in your Vercel Project Settings (Dashboard -> Settings -> Environment Variables):
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (Required for API/Auth functions)
- `SUPABASE_JWT_SECRET` (Required for Auth)

---

## 2. Admin: Updating Race Data

The easiest and most reliable way to update race results/points is to run the existing Python scripts from your local machine. This avoids serverless timeouts and IP blocking issues often faced by scrapers in the cloud.

### One-Time Setup
1. Ensure Python 3.11+ is installed.
2. Install dependencies:
   ```bash
   pip install -r ingest/requirements.txt
   ```
3. Ensure your local `.env` file in the root directory contains the **Service Role Key** (needed for writing to the database):
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

### Bi-Weekly Update Routine
After a real-life race concludes, run the sync script to scrape ProCyclingStats, update results, and recalculate team points.

**Command:**
```bash
python -m ingest.daily_sync --season-year 2026 --sync-all
```

**What this does:**
1. Reads the list of races from `references/Races_2026.txt`.
2. Fetches results for any 2026 races available on PCS.
3. Upserts results into the `race_results` table.
4. Auto-calculates points for all riders based on their results.
5. Updates the global leaderboard and team scores.

### Troubleshooting
- **Cloudflare Blocks**: If the script hangs or fails with 403s on PCS URLs, user their "Cookie" method mentioned in `ingest/README.md`, or run the script after waiting a few minutes.
- **Missing Races**: Update `references/Races_2026.txt` with the PCS slug if a new race needs to be tracked.
