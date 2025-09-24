import { SectionWrapper } from '../SectionWrapper';
import { PreinstallConfig } from '../PreinstalledContractsSection';
import { useMemo, useCallback } from 'react';
import { useGenesisHighlight } from '../GenesisHighlightContext';
import { cn } from '@/lib/cn';

type PredeploysSectionProps = {
    config: PreinstallConfig;
    onConfigChange: (config: PreinstallConfig) => void;
    ownerAddress?: string;
    tokenName?: string;
    tokenSymbol?: string;
    isExpanded: boolean;
    toggleExpand: () => void;
    compact?: boolean;
};

export const PredeploysSection = ({
    config,
    onConfigChange,
    ownerAddress,
    tokenName,
    tokenSymbol,
    isExpanded,
    toggleExpand,
    compact
}: PredeploysSectionProps) => {
    const { setHighlightPath, clearHighlight } = useGenesisHighlight();
    const enabledCount = useMemo(() => Object.values(config).filter(Boolean).length, [config]);
    const totalCount = useMemo(() => Object.keys(config).length, [config]);

    // Custom green switch component
    const GreenSwitch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
        <button
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-green-500/20",
                checked ? "bg-green-600 dark:bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    checked ? "translate-x-5" : "translate-x-0.5"
                )}
            />
        </button>
    );

    const handleToggle = useCallback((key: keyof PreinstallConfig, enabled: boolean) => {
        let next = { ...config, [key]: enabled } as PreinstallConfig;
        if (key === 'proxy') {
            next.proxyAdmin = enabled;
        }
        if (key === 'proxyAdmin') {
            next.proxy = enabled;
        }
        onConfigChange(next);
        
        // Highlight the predeploy in JSON when enabled
        if (enabled) {
            // Use the actual predeploy key for highlighting
            const highlightKey = `predeploy-${key}`;
            setHighlightPath(highlightKey);
            setTimeout(() => clearHighlight(), 2000);
        }
    }, [config, onConfigChange, setHighlightPath, clearHighlight]);

    const items: { id: keyof PreinstallConfig; label: string }[] = [
        { id: 'proxy', label: 'Transparent Upgradeable Proxy' },
        { id: 'proxyAdmin', label: 'Proxy Admin Contract' },
        { id: 'icmMessenger', label: 'ICM Messenger' },
        { id: 'wrappedNativeToken', label: `Wrapped ${tokenName || 'Native Token'}` },
        { id: 'safeSingletonFactory', label: 'Safe Singleton Factory' },
        { id: 'multicall3', label: 'Multicall3' },
        { id: 'create2Deployer', label: 'Create2Deployer' }
    ];
    return (
        <SectionWrapper
            title="Pre-Deploys"
            description={compact ? '' : 'Enable pre-deployed contracts to ship with your genesis.'}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            sectionId="predeploys"
            compact={compact}
            variant="flat"
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                    <div className="text-zinc-600 dark:text-zinc-400">Enabled</div>
                    <div className="text-zinc-700 dark:text-zinc-300 font-medium">{enabledCount} / {totalCount}</div>
                </div>

                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-3 py-2 text-[12px] bg-white dark:bg-zinc-950">
                            <div className="text-zinc-800 dark:text-zinc-200 truncate pr-3">{item.label}</div>
                            <GreenSwitch checked={config[item.id]} onCheckedChange={(c) => handleToggle(item.id, !!c)} />
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
};


