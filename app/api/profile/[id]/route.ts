import { NextRequest, NextResponse } from 'next/server';
import { getProfile, updateProfile } from '@/server/services/profile';
import { Profile } from '@/types/profile';
import { withAuth } from '@/lib/protectedRoute';

export const GET = withAuth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  session: any
) => {
  try {
    const id = (await params).id;
    if (!id) {
      return NextResponse.json(
        { error: 'Id parameter is required.' },
        { status: 400 }
      );
    }

    // Check if user is trying to access their own profile
    const isOwnProfile = session.user.id === id;
    if (!isOwnProfile) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    const profile = await getProfile(id);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in GET /api/profile/[id]', error);
    return NextResponse.json(
      { error: `: ${error}` },
      { status: 400 }
    );
  }
});

export const PUT = withAuth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  session: any
) => {
  try {
    const id = (await params).id;
    if (!id) {
      return NextResponse.json(
        { error: 'Id parameter is required.' },
        { status: 400 }
      );
    }

    // Use strict equality check
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own profile.' },
        { status: 403 }
      );
    }

    const newProfileData = (await req.json()) as Partial<Profile>;

    const updatedProfile = await updateProfile(
      id,
      newProfileData
    );

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error in PUT /api/profile/[id]:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
});
