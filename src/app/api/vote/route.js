import { NextResponse } from 'next/server';
import { checkVote, submitVote } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { deviceId, eventId, creatividad, sabor, presentacion, actividad } = body;
    const userAgent = request.headers.get('user-agent') || '';

    // Create a hash of deviceId + userAgent for better protection
    const deviceIdHash = crypto
      .createHash('sha256')
      .update(deviceId + userAgent)
      .digest('hex');

    // Check if already voted
    const alreadyVoted = await checkVote(eventId, deviceIdHash);
    if (alreadyVoted) {
      return NextResponse.json({ error: 'Ya calificaste este evento 🎉' }, { status: 400 });
    }

    // Save vote
    await submitVote({
      eventId,
      deviceId: deviceIdHash,
      creativity: creatividad,
      flavor: sabor,
      presentation: presentacion,
      activity: actividad,
    });

    return NextResponse.json({ message: 'Voto registrado con éxito' });
  } catch (error) {
    console.error('API Error:', error);
    // Explicit handle for unique constraint violation if race condition occurs
    if (error.code === '23505') {
       return NextResponse.json({ error: 'Ya calificaste este evento 🎉' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const deviceId = searchParams.get('deviceId');
    const userAgent = request.headers.get('user-agent') || '';

    if (!eventId || !deviceId) {
        return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const deviceIdHash = crypto
      .createHash('sha256')
      .update(deviceId + userAgent)
      .digest('hex');

    const alreadyVoted = await checkVote(eventId, deviceIdHash);
    return NextResponse.json({ alreadyVoted });
}
