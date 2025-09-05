import type { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { loadFonts, createOGResponse } from '@/utils/og-image';
import { blog } from '@/lib/source';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<ImageResponse> {
  const { slug } = await params;
  const { searchParams } = request.nextUrl;
  const rawTitle = searchParams.get('title');
  const title = rawTitle?.replace(/\s*\|\s*Avalanche Builder Hub$/, '');
  const description = searchParams.get('description');
  const fonts = await loadFonts();

  try {
    // Try to get the blog post to ensure it exists
    const page = blog.getPage([slug]);
    
    if (!page) {
      return createOGResponse({
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found',
        path: 'blog',
        fonts
      });
    }

    return createOGResponse({
      title: title ?? page.data.title,
      description: description ?? page.data.description ?? 'Takeaways and tutorials from building a network of fast, efficient, highly-optimized chains.',
      path: 'blog',
      fonts
    });
  } catch (error) {
    return createOGResponse({
      title: title ?? 'Blog',
      description: description ?? 'Takeaways and tutorials from building a network of fast, efficient, highly-optimized chains.',
      path: 'blog',
      fonts
    });
  }
}