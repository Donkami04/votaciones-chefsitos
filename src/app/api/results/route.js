import { NextResponse } from 'next/server';
import { getResults } from '@/lib/db';

export async function GET() {
  try {
    const results = await getResults();
    return NextResponse.json(results);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
