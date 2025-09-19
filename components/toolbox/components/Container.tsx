"use client"

import type { ReactNode } from "react"
import { ReportIssueButton } from "@/components/console/report-issue-button"

interface ContainerProps {
  title: string
  children: ReactNode
  description?: ReactNode
}

// simplified container does not use color themes currently

export function Container({
  title,
  children,
  description,
}: ContainerProps) {

  return (<>
    <div className="relative bg-gradient-to-r from-transparent via-red-50/30 to-red-100/50 dark:from-transparent dark:via-red-950/20 dark:to-red-900/30 rounded-2xl p-6 -m-6 mb-4">
      {/* Scattered Red Spray Elements - çok dağınık */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute top-2 right-12 w-3 h-3 bg-red-300/20 dark:bg-red-700/15 rounded-full blur-[1px]"></div>
        <div className="absolute top-8 right-32 w-2 h-2 bg-red-400/25 dark:bg-red-600/18 rounded-full blur-[2px]"></div>
        <div className="absolute top-16 right-8 w-4 h-4 bg-red-200/15 dark:bg-red-800/12 rounded-full blur-sm"></div>
        <div className="absolute top-24 right-48 w-1.5 h-1.5 bg-red-500/30 dark:bg-red-500/20 rounded-full"></div>
        <div className="absolute top-4 right-56 w-2.5 h-2.5 bg-red-300/18 dark:bg-red-700/14 rounded-full blur-[1px]"></div>
        <div className="absolute top-32 right-24 w-1 h-1 bg-red-400/35 dark:bg-red-600/25 rounded-full"></div>
        <div className="absolute top-12 right-64 w-3.5 h-3.5 bg-red-200/12 dark:bg-red-800/10 rounded-full blur-[3px]"></div>
        <div className="absolute top-28 right-40 w-1.5 h-1.5 bg-red-500/22 dark:bg-red-500/16 rounded-full blur-[1px]"></div>
        <div className="absolute top-6 right-72 w-2 h-2 bg-red-300/16 dark:bg-red-700/12 rounded-full blur-[2px]"></div>
        <div className="absolute top-20 right-16 w-1 h-1 bg-red-400/28 dark:bg-red-600/20 rounded-full"></div>
        <div className="absolute top-36 right-60 w-2.5 h-2.5 bg-red-200/14 dark:bg-red-800/11 rounded-full blur-sm"></div>
        <div className="absolute top-10 right-80 w-1.5 h-1.5 bg-red-500/20 dark:bg-red-500/15 rounded-full blur-[1px]"></div>
        <div className="absolute top-30 right-4 w-3 h-3 bg-red-300/22 dark:bg-red-700/16 rounded-full blur-[2px]"></div>
        <div className="absolute top-14 right-88 w-1 h-1 bg-red-400/32 dark:bg-red-600/22 rounded-full"></div>
        <div className="absolute top-26 right-52 w-2 h-2 bg-red-200/18 dark:bg-red-800/13 rounded-full blur-[1px]"></div>
        
        {/* Additional scattered dots */}
        <div className="absolute top-3 right-20 w-1 h-1 bg-red-300/25 dark:bg-red-700/18 rounded-full"></div>
        <div className="absolute top-18 right-68 w-2 h-2 bg-red-400/20 dark:bg-red-600/15 rounded-full blur-[1px]"></div>
        <div className="absolute top-34 right-12 w-1.5 h-1.5 bg-red-200/22 dark:bg-red-800/16 rounded-full blur-[2px]"></div>
        <div className="absolute top-7 right-44 w-1 h-1 bg-red-500/28 dark:bg-red-500/20 rounded-full"></div>
        <div className="absolute top-22 right-76 w-2.5 h-2.5 bg-red-300/15 dark:bg-red-700/12 rounded-full blur-sm"></div>
        <div className="absolute top-38 right-36 w-1 h-1 bg-red-400/30 dark:bg-red-600/22 rounded-full"></div>
        <div className="absolute top-5 right-84 w-1.5 h-1.5 bg-red-200/20 dark:bg-red-800/14 rounded-full blur-[1px]"></div>
        <div className="absolute top-15 right-28 w-1 h-1 bg-red-500/25 dark:bg-red-500/18 rounded-full"></div>
        <div className="absolute top-33 right-56 w-2 h-2 bg-red-300/18 dark:bg-red-700/13 rounded-full blur-[2px]"></div>
        <div className="absolute top-9 right-92 w-1 h-1 bg-red-400/26 dark:bg-red-600/19 rounded-full"></div>
        <div className="absolute top-25 right-8 w-1.5 h-1.5 bg-red-200/24 dark:bg-red-800/17 rounded-full blur-[1px]"></div>
        <div className="absolute top-1 right-96 w-1 h-1 bg-red-500/22 dark:bg-red-500/16 rounded-full"></div>
        <div className="absolute top-17 right-100 w-2 h-2 bg-red-300/16 dark:bg-red-700/12 rounded-full blur-sm"></div>
        <div className="absolute top-35 right-20 w-1 h-1 bg-red-400/24 dark:bg-red-600/17 rounded-full"></div>
        <div className="absolute top-11 right-104 w-1.5 h-1.5 bg-red-200/19 dark:bg-red-800/14 rounded-full blur-[2px]"></div>
      </div>
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-md text-muted-foreground font-light leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        <ReportIssueButton toolTitle={title} />
      </div>
      <div className="w-12 h-px bg-foreground/20"></div>
    </div>
    <div className="space-y-8 text-foreground prose">{children}</div>
  </>
  );
}