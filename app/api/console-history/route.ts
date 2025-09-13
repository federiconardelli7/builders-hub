import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/authSession';
import { prisma } from '@/prisma/prisma';

// GET /api/console-history - Get user's console history
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();    

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized, please sign in to continue.' }, { status: 401 });
    }
    const history = await prisma.consoleHistory.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'desc' },
      take: 100 // Limit to last 100 items
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching console history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/console-history - Add new history item
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized, please sign in to continue.' }, { status: 401 });
    }
    const body = await req.json();
    if (!body) {
      return NextResponse.json({ error: 'No body provided.' }, { status: 400 });
    }
    if (!body.title || !body.status || !body.eventType) {
      return NextResponse.json({ error: 'Title, status, and eventType are required.' }, { status: 400 });
    }
    const { title, description, status, eventType, data } = body;

    const historyItem = await prisma.consoleHistory.create({
      data: {
        user_id: session?.user.id,
        title,
        description,
        status,
        event_type: eventType,
        data
      }
    });
    return NextResponse.json(historyItem);
  } catch (error) {
    console.error('Error adding console history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// History deletion is disabled for audit / metric purposes
