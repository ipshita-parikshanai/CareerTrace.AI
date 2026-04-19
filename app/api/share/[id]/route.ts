import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid trace id.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('shared_traces')
      .select('payload, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('shared_traces fetch failed:', error);
      return NextResponse.json({ error: 'Could not load trace.' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Trace not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: data.payload });
  } catch (e) {
    console.error('share GET failed:', e);
    return NextResponse.json({ error: 'Could not load trace.' }, { status: 500 });
  }
}
