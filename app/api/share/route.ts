import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSupabase } from '@/lib/supabase/client';
import type {
  CareerInsights,
  CareerJourney,
  LinkedInProfile,
} from '@/lib/types';

export interface SharedTracePayload {
  userProfile: LinkedInProfile;
  careerJourneys: CareerJourney[];
  insights: CareerInsights | null;
  goalTitle: string;
  goalCompany?: string | null;
  goalIndustry?: string | null;
  userLinkedInUrl?: string;
  createdAt: string;
}

/**
 * POST /api/share — saves a snapshot of the current trace and returns a uuid
 * suitable for sharing via /trace/[id]. The payload is read-only: the share
 * URL acts as the auth token (anyone with the link can view).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SharedTracePayload>;

    if (!body.userProfile || !Array.isArray(body.careerJourneys) || body.careerJourneys.length === 0) {
      return NextResponse.json(
        { error: 'Missing userProfile or careerJourneys.' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const payload: SharedTracePayload = {
      userProfile: body.userProfile,
      careerJourneys: body.careerJourneys,
      insights: body.insights ?? null,
      goalTitle: body.goalTitle ?? '',
      goalCompany: body.goalCompany ?? null,
      goalIndustry: body.goalIndustry ?? null,
      userLinkedInUrl: body.userLinkedInUrl,
      createdAt: new Date().toISOString(),
    };

    const db = getSupabase();
    if (!db) {
      return NextResponse.json(
        {
          error:
            'Shared traces require Supabase. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.',
        },
        { status: 503 }
      );
    }

    const { error } = await db
      .from('shared_traces')
      .insert({
        id,
        goal_title: payload.goalTitle || null,
        user_name: payload.userProfile.name || null,
        payload,
      });

    if (error) {
      console.error('shared_traces insert failed:', error);
      // 42P01 = undefined_table (Supabase migration not run yet)
      if (error.code === '42P01') {
        return NextResponse.json(
          {
            error:
              'shared_traces table is missing. Run lib/supabase/schema.sql in Supabase SQL editor.',
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: 'Could not save shared trace.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (e) {
    console.error('share POST failed:', e);
    return NextResponse.json({ error: 'Could not save shared trace.' }, { status: 500 });
  }
}
