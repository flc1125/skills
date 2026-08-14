import { getSkillBySlug } from '@/lib/skills';
import {
  isSkillStatsEnabled,
  recordSkillInteraction,
  type SkillInteraction,
} from '@/lib/skill-stats';
import { NextRequest, NextResponse } from 'next/server';

const VISITOR_COOKIE = 'flc-skills-visitor';
const VISITOR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const VISITOR_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_INTERACTIONS = new Set<SkillInteraction>(['view', 'copy']);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }

  if (!isSkillStatsEnabled()) {
    return NextResponse.json(
      { error: 'Skill statistics are not configured' },
      { status: 503 }
    );
  }

  let body: { interaction?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!VALID_INTERACTIONS.has(body.interaction as SkillInteraction)) {
    return NextResponse.json({ error: 'Invalid interaction' }, { status: 400 });
  }

  const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const hasValidVisitorId = Boolean(
    existingVisitorId && VISITOR_ID_PATTERN.test(existingVisitorId)
  );
  const visitorId = hasValidVisitorId ? existingVisitorId! : crypto.randomUUID();
  const result = await recordSkillInteraction(
    slug,
    body.interaction as SkillInteraction,
    visitorId
  );

  if (!result) {
    return NextResponse.json(
      { error: 'Skill statistics are not configured' },
      { status: 503 }
    );
  }

  const response = NextResponse.json(result, {
    headers: {
      'Cache-Control': 'private, no-store',
    },
  });

  if (!hasValidVisitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: VISITOR_COOKIE_MAX_AGE,
    });
  }

  return response;
}
