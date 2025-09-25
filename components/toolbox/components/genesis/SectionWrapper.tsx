import { ChevronDown, ChevronUp, Info, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';

type SectionWrapperProps = {
    title: string;
    description: string;
    titleTooltip?: string;
    titleTooltipLink?: { href: string; text: string };
    isExpanded: boolean;
    toggleExpand: () => void;
    children: React.ReactNode;
    sectionId: string; // Added for key prop if needed
    compact?: boolean;
    variant?: "card" | "flat";
};

export const SectionWrapper = ({ title, description, titleTooltip, titleTooltipLink, isExpanded, toggleExpand, children, sectionId, compact, variant = "card" }: SectionWrapperProps) => {
    if (variant === "flat") {
        return (
            <div key={sectionId} className="space-y-3">
                <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-baseline gap-1.5">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">{title}</h3>
                        {titleTooltip && (
                            <Tooltip>
                                <TooltipTrigger className="inline-flex">
                                    <Info className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <div className="space-y-2">
                                        <p className="text-xs">{titleTooltip}</p>
                                        {titleTooltipLink && (
                                            <Link 
                                                href={titleTooltipLink.href}
                                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                            >
                                                {titleTooltipLink.text}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    {!compact && description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
                    )}
                </div>
                <div>{children}</div>
            </div>
        );
    }
    return (
        <div key={sectionId} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
            <div 
                className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center cursor-pointer" 
                onClick={toggleExpand}
            >
                <div>
                    <div className="flex items-baseline gap-1.5">
                        <h3 className="text-base mb-0.5 font-medium text-zinc-800 dark:text-white">{title}</h3>
                        {titleTooltip && (
                            <Tooltip>
                                <TooltipTrigger onClick={(e) => e.stopPropagation()} className="inline-flex">
                                    <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <div className="space-y-2">
                                        <p className="text-xs">{titleTooltip}</p>
                                        {titleTooltipLink && (
                                            <Link 
                                                href={titleTooltipLink.href}
                                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                            >
                                                {titleTooltipLink.text}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    {!compact && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0 mb-0">
                            {description}
                        </p>
                    )}
                </div>
                <div>
                    {isExpanded ? 
                        <ChevronUp className="h-5 w-5 text-zinc-500 dark:text-zinc-400" /> : 
                        <ChevronDown className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    }
                </div>
            </div>
            {isExpanded && (
                <div className="p-4">
                    {children}
                </div>
            )}
        </div>
    );
}; 