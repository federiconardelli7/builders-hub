import { SectionWrapper } from '../SectionWrapper';
import { PreinstallConfig } from '../types';
import { useMemo, useCallback } from 'react';
import { useGenesisHighlight } from '../GenesisHighlightContext';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, ExternalLink } from 'lucide-react';

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

    // Predeploy addresses and descriptions
    const predeployInfo = {
        proxy: {
            address: '0xfacade0000000000000000000000000000000000',
            name: 'Transparent Upgradeable Proxy',
            description: 'Enables upgradeability for smart contracts. Delegates calls to implementation contracts while preserving storage.',
            githubUrl: 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/proxy/transparent/TransparentUpgradeableProxy.sol'
        },
        proxyAdmin: {
            address: '0xdad0000000000000000000000000000000000000',
            name: 'Proxy Admin Contract',
            description: 'Manages upgrades for transparent proxies. Controls which addresses can upgrade proxy implementations.',
            githubUrl: 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/proxy/transparent/ProxyAdmin.sol'
        },
        icmMessenger: {
            address: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
            name: 'ICM Messenger',
            description: 'Avalanche Interchain Messaging contract for cross-subnet communication and message relaying.',
            githubUrl: 'https://github.com/ava-labs/icm-contracts/blob/main/contracts/teleporter/TeleporterMessenger.sol'
        },
        wrappedNativeToken: {
            address: '0x1111111111111111111111111111111111111111',
            name: `Wrapped ${tokenName || 'Native Token'}`,
            description: 'ERC-20 wrapper for the native token, enabling DeFi integrations and smart contract interactions.',
            githubUrl: 'https://github.com/ava-labs/icm-contracts/blob/main/contracts/ictt/WrappedNativeToken.sol'
        },
        safeSingletonFactory: {
            address: '0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7',
            name: 'Safe Singleton Factory',
            description: 'Deploys Safe multisig wallet contracts at deterministic addresses across all chains.',
            githubUrl: 'https://github.com/safe-global/safe-singleton-factory/blob/main/source/deterministic-deployment-proxy.yul'
        },
        multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
            name: 'Multicall3',
            description: 'Batches multiple contract calls into a single transaction, reducing gas costs and improving efficiency.',
            githubUrl: 'https://github.com/mds1/multicall/blob/main/src/Multicall3.sol'
        },
        create2Deployer: {
            address: '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2',
            name: 'Create2 Deployer',
            description: 'Enables deterministic contract deployment using CREATE2 opcode for same address across chains.',
            githubUrl: 'https://github.com/pcaversaccio/create2deployer/blob/main/contracts/Create2Deployer.sol'
        }
    };

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
            // Delay highlight to allow JSON to regenerate (debounced at 300ms)
            setTimeout(() => {
                // Use the actual predeploy key for highlighting  
                const highlightKey = `predeploy-${key}`;
                setHighlightPath(highlightKey);
                setTimeout(() => clearHighlight(), 2000);
            }, 400);
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
            titleTooltip="Pre-deployed contracts are smart contracts that exist on your blockchain from the moment it launches. These provide essential functionality like multi-sig wallets, token wrapping, and cross-chain messaging without requiring manual deployment."
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
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{item.label}</span>
                                {predeployInfo[item.id as keyof typeof predeployInfo] && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="font-semibold">{predeployInfo[item.id as keyof typeof predeployInfo].name}</div>
                                                    <div className="text-xs font-mono mt-1">{predeployInfo[item.id as keyof typeof predeployInfo].address}</div>
                                                </div>
                                                <div className="text-xs">{predeployInfo[item.id as keyof typeof predeployInfo].description}</div>
                                                {predeployInfo[item.id as keyof typeof predeployInfo].githubUrl && (
                                                    <a 
                                                        href={predeployInfo[item.id as keyof typeof predeployInfo].githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                                    >
                                                        View contract source
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                            <GreenSwitch checked={config[item.id]} onCheckedChange={(c) => handleToggle(item.id, !!c)} />
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
};


