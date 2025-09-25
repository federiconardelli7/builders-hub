import { Dispatch, SetStateAction, useCallback } from 'react';
import { Address } from 'viem';
import { SectionWrapper } from '../SectionWrapper';
import { Input } from '../../Input';
import TokenAllocationList from '../TokenAllocationList';
import AllowlistPrecompileConfigurator from '../AllowlistPrecompileConfigurator';
import { AllocationEntry, AllowlistPrecompileConfig } from '../types';
import { useGenesisHighlight } from '../GenesisHighlightContext';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type TokenomicsSectionProps = {
    tokenAllocations: AllocationEntry[];
    setTokenAllocations: (allocations: AllocationEntry[]) => void;
    nativeMinterConfig: AllowlistPrecompileConfig;
    setNativeMinterConfig: Dispatch<SetStateAction<AllowlistPrecompileConfig>>;
    tokenName: string;
    setTokenName: Dispatch<SetStateAction<string>>;
    tokenSymbol?: string;
    setTokenSymbol?: Dispatch<SetStateAction<string>>;
    isExpanded: boolean;
    toggleExpand: () => void;
    validationErrors: { [key: string]: string };
    compact?: boolean;
    walletAddress?: Address;
};

export const TokenomicsSection = ({
    tokenAllocations,
    setTokenAllocations,
    nativeMinterConfig,
    setNativeMinterConfig,
    tokenName,
    setTokenName,
    tokenSymbol,
    setTokenSymbol,
    isExpanded,
    toggleExpand,
    validationErrors, // Pass errors object
    compact,
    walletAddress,
}: TokenomicsSectionProps) => {
    const { setHighlightPath, clearHighlight } = useGenesisHighlight();

    const handleFocus = (path: string) => {
        setHighlightPath(path);
    };

    const handleBlur = () => {
        clearHighlight();
    };

    // Precompile info
    const nativeMinterInfo = {
        address: '0x0200000000000000000000000000000000000001',
        name: 'Native Minter',
        description: 'Allows authorized addresses to mint new native tokens, increasing the total supply on your blockchain.'
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

    const handleSwitchChange = (precompileType: string, value: boolean) => {
        if (value) {
            // Delay highlight to allow JSON to regenerate (debounced at 300ms)
            setTimeout(() => {
                setHighlightPath(`config.${precompileType}`);
                setTimeout(() => clearHighlight(), 2000); // Clear after 2 seconds
            }, 400);
        }
    };


    return (
        <SectionWrapper
            title="Tokenomics"
            description={compact ? '' : 'Configure your blockchain\'s native token economics.'}
            titleTooltip="Configure your blockchain's native token economics including initial distribution and minting permissions."
            titleTooltipLink={{ href: "/docs/avalanche-l1s/evm-configuration/tokenomics", text: "Learn more about tokenomics" }}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            sectionId="tokenomics"
            compact={compact}
            variant="flat"
        >
            <div className="space-y-4">
                 {/* Coin Name Fields */} 
                 <div className="grid grid-cols-2 gap-4">
                     <Input
                        label="Token Name"
                        value={tokenName}
                        onChange={setTokenName}
                        placeholder="COIN"
                        onFocus={() => handleFocus('tokenName')}
                        onBlur={handleBlur}
                    />
                    <Input
                        label="Token Symbol"
                        value={tokenSymbol || ''}
                        onChange={setTokenSymbol || (() => {})}
                        placeholder="COIN"
                    />
                 </div>

                 {/* Initial Token Allocation */}
                 <div>
                    <TokenAllocationList
                        allocations={tokenAllocations}
                        onAllocationsChange={setTokenAllocations}
                        compact={compact}
                    />
                    {validationErrors.tokenAllocations && <p className="text-red-500 text-sm mt-1">{validationErrors.tokenAllocations}</p>}
                </div>

                {/* Native Token Minter */}
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
                    <div className="px-3 py-2 text-[12px] bg-white dark:bg-zinc-950">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">Native Token Minter</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <div className="space-y-1">
                                            <div className="font-semibold">{nativeMinterInfo.name}</div>
                                            <div className="text-xs font-mono">{nativeMinterInfo.address}</div>
                                            <div className="text-xs">{nativeMinterInfo.description}</div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <GreenSwitch checked={!!nativeMinterConfig.activated} onCheckedChange={(c) => {
                                const isEnabled = !!c;
                                setNativeMinterConfig(prev => {
                                    const newConfig = { ...prev, activated: isEnabled };
                                    // Auto-add wallet address as admin when enabling
                                    if (isEnabled && walletAddress && (!prev.addresses?.Admin || prev.addresses.Admin.length === 0)) {
                                        newConfig.addresses = {
                                            ...(prev.addresses || { Admin: [], Manager: [], Enabled: [] }),
                                            Admin: [{ 
                                                id: `admin-${Date.now()}`,
                                                address: walletAddress, 
                                                error: undefined, 
                                                requiredReason: undefined 
                                            }]
                                        };
                                    }
                                    return newConfig;
                                });
                                handleSwitchChange('contractNativeMinterConfig', isEnabled);
                            }} />
                        </div>
                        {nativeMinterConfig.activated && (
                            <div className="mt-2">
                                <AllowlistPrecompileConfigurator
                                    title=""
                                    description={compact ? '' : 'Addresses allowed to mint native tokens'}
                                    precompileAction="mint native tokens"
                                    config={nativeMinterConfig}
                                    onUpdateConfig={setNativeMinterConfig}
                                    radioOptionFalseLabel=""
                                    radioOptionTrueLabel=""
                                    validationError={validationErrors.contractNativeMinter}
                                    showActivationToggle={false}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}; 