import type { Metadata } from 'next';
import { createMetadata } from '@/utils/metadata';
import { AcademyLayout } from '@/components/academy/shared/academy-layout';
import { codebaseEntrepreneurLandingPageConfig } from '@/components/academy/landing-page-configs/codebase-entrepreneur.config';
import { SuccessStories } from '@/components/academy/codebase-entrepreneur/success-stories';

export const metadata: Metadata = createMetadata({
    title: 'Codebase Entrepreneur Academy',
    description: 'Join the next generation of Web3 entrepreneurs. Learn how to build, launch, and scale your blockchain startup.',
    openGraph: {
        url: '/academy/codebase-entrepreneur',
        images: {
            url: '/api/og/academy/codebase-entrepreneur',
            width: 1200,
            height: 630,
            alt: 'Codebase Entrepreneur Academy',
        },
    },
    twitter: {
        images: {
            url: '/api/og/academy/codebase-entrepreneur',
            width: 1200,
            height: 630,
            alt: 'Codebase Entrepreneur Academy',
        },
    },
});

export default function CodebaseEntrepreneurPage(): React.ReactElement {
    const { features } = codebaseEntrepreneurLandingPageConfig;

    return (
        <AcademyLayout
            config={codebaseEntrepreneurLandingPageConfig}
            afterLearningPath={
                <>
                    {/* Success Stories - now appears after learning tree */}
                    {features?.successStories && (
                        <SuccessStories
                            title={features.successStories.title}
                            stories={features.successStories.stories}
                        />
                    )}
                </>
            }
        />
    );
}
