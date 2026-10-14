# Visitor tracking

The frontend sends one text/plain beacon per document load to the public Edge Function. A module guard prevents React remount duplicates; refresh creates a new document and request. A single keepalive fetch is the fallback. Local tracking is disabled. No frontend SDK, cookies or keys are used. Navigation between simulator panels is not another page visit.

## Deploy

The existing project is `qbpyclyaxmingibovdli`. Install/use the official Supabase CLI, then:

```sh
npx supabase login
npx supabase link --project-ref qbpyclyaxmingibovdli
npx supabase db push
npx supabase functions deploy track-visit --project-ref qbpyclyaxmingibovdli --no-verify-jwt
```

The initial table was created manually in SQL Editor. Before `db push`, mark that already-applied migration with `npx supabase migration repair 202610140001 --status applied`. Do not apply a duplicate create-table migration. The Edge Function was deployed manually using the provided standalone equivalent of index.ts + handler.ts. Supabase provides the administrative environment server-side; never place privileged keys in frontend configuration.

`.env.production` contains only the public endpoint. Override `NEXT_PUBLIC_TRACKING_ENDPOINT` before the Pages build if using a different project; rebuild with `PAGES_BUILD=1 npm run build` and publish out/ to gh-pages. To enable local test tracking explicitly, set `NEXT_PUBLIC_TRACK_LOCAL=1` and the endpoint in .env.local.

## Inspect

Open https://supabase.com/dashboard/project/qbpyclyaxmingibovdli/editor and choose public.page_visits, or run in SQL Editor:

```sql
SELECT visited_at, ip, path, user_agent, referrer
FROM public.page_visits
ORDER BY visited_at DESC
LIMIT 100;

SELECT count(*) AS total_visits FROM public.page_visits;
```

## Verify

POST text/plain JSON with path to the function without authorization; expect 204. Open the live site and refresh, then inspect two new rows. The database assigns visited_at and id. Verify that `has_table_privilege('anon','public.page_visits','SELECT')` and the equivalent INSERT check are false and that the table has RLS enabled with no public policies. Anonymous REST reads must not return records. Unit tests cover sender deduplication/fallback/local skips, IP extraction, bounded payloads and generic errors.

IP capture is best effort. Proxy headers must be supplied/overwritten by the hosting platform; forged requests, bots, VPNs and proxies can affect results. An IP does not identify a person. IP addresses are personal data: disclose collection, restrict access, and retain only as needed (for example periodically delete rows older than 30 days). Requests can be blocked by browsers or networks, so this is not guaranteed visitor delivery. No notification email is sent.
