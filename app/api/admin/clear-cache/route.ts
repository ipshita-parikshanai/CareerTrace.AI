import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * Wipe Supabase caches. Requires `?confirm=yes` so it can't be hit accidentally.
 *
 * Tables wiped (each behind its own boolean flag, default true when omitted):
 *   - linkedin_profiles      (LinkedIn enrich cache)
 *   - career_searches        (insights cache + saved traces)
 *   - shared_traces          (read-only shared trace links — kept by default)
 *
 * Examples:
 *   curl -X POST 'http://localhost:3001/api/admin/clear-cache?confirm=yes'
 *     → wipes linkedin_profiles + career_searches
 *
 *   curl -X POST 'http://localhost:3001/api/admin/clear-cache?confirm=yes&shared=yes'
 *     → also wipes shared_traces
 *
 *   curl -X POST 'http://localhost:3001/api/admin/clear-cache?confirm=yes&url=https://linkedin.com/in/foo'
 *     → wipes only that one cached enrich row
 *
 *   curl -X POST 'http://localhost:3001/api/admin/clear-cache?confirm=yes&olderThanDays=7'
 *     → wipes enrich rows older than 7 days
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  if (url.searchParams.get('confirm') !== 'yes') {
    return NextResponse.json(
      {
        error:
          "This endpoint wipes Supabase cache tables. Re-send with ?confirm=yes to proceed.",
      },
      { status: 400 }
    );
  }

  const targetUrl = url.searchParams.get('url');
  const olderThanDays = url.searchParams.get('olderThanDays');
  const wipeShared = url.searchParams.get('shared') === 'yes';

  const results: Record<string, { deleted: number | null; error: string | null }> = {};

  // ---------- linkedin_profiles ----------
  let lpQuery = supabase.from('linkedin_profiles').delete();
  if (targetUrl) {
    lpQuery = lpQuery.eq('linkedin_url', targetUrl);
  } else if (olderThanDays) {
    const days = Math.max(1, Number(olderThanDays) || 0);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    lpQuery = lpQuery.lt('last_enriched_at', cutoff);
  } else {
    lpQuery = lpQuery.not('last_enriched_at', 'is', null);
  }
  const lpRes = await lpQuery.select('linkedin_url');
  results.linkedin_profiles = {
    deleted: lpRes.count ?? (Array.isArray(lpRes.data) ? lpRes.data.length : null),
    error: lpRes.error?.message ?? null,
  };

  // ---------- career_searches ----------
  if (!targetUrl && !olderThanDays) {
    const csRes = await supabase
      .from('career_searches')
      .delete()
      .not('created_at', 'is', null)
      .select('id');
    results.career_searches = {
      deleted: csRes.count ?? (Array.isArray(csRes.data) ? csRes.data.length : null),
      error: csRes.error?.message ?? null,
    };
  }

  // ---------- shared_traces (only when explicitly requested) ----------
  if (wipeShared) {
    const stRes = await supabase
      .from('shared_traces')
      .delete()
      .not('created_at', 'is', null)
      .select('id');
    results.shared_traces = {
      deleted: stRes.count ?? (Array.isArray(stRes.data) ? stRes.data.length : null),
      error: stRes.error?.message ?? null,
    };
  }

  const anyError = Object.values(results).some((r) => r.error);
  return NextResponse.json(
    {
      success: !anyError,
      results,
      scope: targetUrl
        ? `url=${targetUrl}`
        : olderThanDays
          ? `olderThanDays=${olderThanDays}`
          : 'all',
    },
    { status: anyError ? 207 : 200 }
  );
}
