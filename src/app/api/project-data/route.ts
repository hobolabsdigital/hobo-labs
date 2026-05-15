import { NextResponse } from 'next/server';
import { getProjectStaticData } from '@/lib/ai/project-editor';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Missing project slug' }, { status: 400 });
  }

  const data = getProjectStaticData(slug);
  
  if (!data) {
    return NextResponse.json({ error: `Project "${slug}" not found` }, { status: 404 });
  }

  // Omit raw content from the client payload
  const { _rawContent, ...clientData } = data;
  
  return NextResponse.json({ ...clientData, slug, isContextStreaming: true });
}
