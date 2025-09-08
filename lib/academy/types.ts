import type { ReactNode } from 'react';

export interface AcademyConfig {
    id: string;
    name: string;
    heroTitle: string;
    heroAccent: string;
    heroDescription: string;
    pathType: 'avalanche' | 'entrepreneur';
    useRedAccent?: boolean;
    customContent?: ReactNode;
    showBlogs?: boolean;
    features?: {
        successStories?: {
            title: string;
            stories: Array<{
                id: string;
                company: string;
                description: string;
                founder?: string;
                imageUrl?: string;
                link?: string;
            }>;
        };
    };
}
