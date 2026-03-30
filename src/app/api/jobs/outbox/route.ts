import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { outboxEvents } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { publishEvent } from '../../../../lib/events';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Wait longer for DB / Push

export async function POST(request: Request) {
  // 1. Secure the endpoint using Authorization headers
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized CRON trigger' }, { status: 401 });
  }

  try {
    // 2. Query all 'pending' events
    const pendingEvents = await db.select().from(outboxEvents).where(eq(outboxEvents.status, 'pending'));

    if (pendingEvents.length === 0) {
      return NextResponse.json({ message: 'No events to process' }, { status: 200 });
    }

    const results = [];

    // 3. Process events synchronously (or asynchronously with Promise.all)
    for (const event of pendingEvents) {
      try {
        await publishEvent(event.eventName, event.payload);
        
        // Mark as published on success
        await db.update(outboxEvents)
          .set({ status: 'published', updatedAt: new Date() })
          .where(eq(outboxEvents.id, event.id));
        
        results.push({ id: event.id, status: 'published' });
      } catch (err) {
        console.error(`Failed to dispatch Outbox Event ${event.id}`, err);
        // Mark as failed to try again or investigate later
        await db.update(outboxEvents)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(outboxEvents.id, event.id));
        
        results.push({ id: event.id, status: 'failed' });
      }
    }

    return NextResponse.json({ processed: results.length, results }, { status: 200 });

  } catch (error) {
    console.error('Fatal error in outbox processor', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
