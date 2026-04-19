import { NextRequest, NextResponse } from 'next/server';
import { generateOutreachDraft } from '@/lib/ai/outreach';
import type { LinkedInProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { userProfile, mentorProfile, goalTitle } = (await request.json()) as {
      userProfile?: LinkedInProfile;
      mentorProfile?: LinkedInProfile;
      goalTitle?: string;
    };

    if (!userProfile?.name || !mentorProfile?.name) {
      return NextResponse.json(
        { error: 'Missing userProfile or mentorProfile.' },
        { status: 400 }
      );
    }

    const draft = await generateOutreachDraft(
      userProfile,
      mentorProfile,
      (goalTitle || '').trim() || 'your goal role'
    );

    return NextResponse.json({ success: true, data: draft });
  } catch (error) {
    console.error('outreach draft failed:', error);
    return NextResponse.json(
      { error: 'Could not generate outreach draft.' },
      { status: 500 }
    );
  }
}
