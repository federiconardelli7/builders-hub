import { ArrowRight, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SuccessStory {
    id: string;
    company: string;
    description: string;
    founder?: string;
    imageUrl?: string;
    link?: string;
}

interface SuccessStoriesProps {
    title: string;
    stories: SuccessStory[];
}

export function SuccessStories({ title, stories }: SuccessStoriesProps) {
    return (
        <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
                <Building2 className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {title}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stories.map((story) => (
                    <div
                        key={story.id}
                        className="group relative flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-lg transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                    {story.company}
                                </h3>
                                {story.founder && (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Founded by {story.founder}
                                    </p>
                                )}
                            </div>
                            {story.link && story.link !== '#' && (
                                <Link
                                    href={story.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-400 hover:text-red-600 transition-colors"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </Link>
                            )}
                        </div>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 flex-grow">
                            {story.description}
                        </p>

                        {story.link && (
                            <Link
                                href={story.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                            >
                                Learn more
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
