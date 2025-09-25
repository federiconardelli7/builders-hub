import { Dispatch, SetStateAction, useCallback } from 'react';
import { Address } from 'viem';
import { SectionWrapper } from '../SectionWrapper';
import AllowlistPrecompileConfigurator from '../AllowlistPrecompileConfigurator';
import { AllowlistPrecompileConfig } from '../types';
import { useGenesisHighlight } from '../GenesisHighlightContext';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type PermissioningSectionProps = {
    deployerConfig: AllowlistPrecompileConfig;
    setDeployerConfig: Dispatch<SetStateAction<AllowlistPrecompileConfig>>;
    txConfig: AllowlistPrecompileConfig;
    setTxConfig: Dispatch<SetStateAction<AllowlistPrecompileConfig>>;
    isExpanded: boolean;
    toggleExpand: () => void;
    compact?: boolean;
    validationErrors: { [key: string]: string };
    walletAddress?: Address;
};

export const PermissioningSection = ({
    deployerConfig,
    setDeployerConfig,
    txConfig,
    setTxConfig,
    isExpanded,
    toggleExpand,
    compact,
    validationErrors,
    walletAddress
}: PermissioningSectionProps) => {
    const { setHighlightPath, clearHighlight } = useGenesisHighlight();

    // Precompile addresses and descriptions
    const precompileInfo = {
        contractDeployer: {
            address: '0x0200000000000000000000000000000000000000',
            name: 'Contract Deployer Allow List',
            description: 'Controls who can deploy smart contracts on your blockchain. Restricts contract deployment to authorized addresses only.'
        },
        txAllowList: {
            address: '0x0200000000000000000000000000000000000002',
            name: 'Transaction Allow List',
            description: 'Restricts who can submit transactions to your blockchain, creating a permissioned network.'
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
            title="Permissioning"
            description={compact ? '' : 'Configure access controls for contract deployment and transactions.'}
            titleTooltip="Control who can interact with your blockchain. You can restrict contract deployment and transaction submission to specific addresses, creating a permissioned network."
            titleTooltipLink={{ href: "/docs/avalanche-l1s/evm-configuration/permissions", text: "Learn more about permissions" }}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            sectionId="permissioning"
            compact={compact}
            variant="flat"
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                    <div className="text-zinc-600 dark:text-zinc-400">Enabled</div>
                    <div className="text-zinc-700 dark:text-zinc-300 font-medium">{[
                        deployerConfig.activated,
                        txConfig.activated
                    ].filter(Boolean).length} / 2</div>
                </div>

                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
                    {/* Contract Deployer Allowlist */}
                    <div className="px-3 py-2 text-[12px] bg-white dark:bg-zinc-950">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">Contract Deployer Allowlist</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <div className="space-y-1">
                                            <div className="font-semibold">{precompileInfo.contractDeployer.name}</div>
                                            <div className="text-xs font-mono">{precompileInfo.contractDeployer.address}</div>
                                            <div className="text-xs">{precompileInfo.contractDeployer.description}</div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <GreenSwitch checked={!!deployerConfig.activated} onCheckedChange={(c) => {
                                const isEnabled = !!c;
                                setDeployerConfig(prev => {
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
                                handleSwitchChange('contractDeployerAllowListConfig', isEnabled);
                            }} />
                        </div>
                        {deployerConfig.activated && (
                            <div className="mt-2">
                                <AllowlistPrecompileConfigurator
                                    title=""
                                    description={compact ? '' : 'Addresses allowed to deploy smart contracts'}
                                    precompileAction="deploy contracts"
                                    config={deployerConfig}
                                    onUpdateConfig={setDeployerConfig}
                                    radioOptionFalseLabel=""
                                    radioOptionTrueLabel=""
                                    validationError={validationErrors.contractDeployerAllowList}
                                    showActivationToggle={false}
                                />
                            </div>
                        )}
                    </div>

                    {/* Transaction Allowlist */}
                    <div className="px-3 py-2 text-[12px] bg-white dark:bg-zinc-950">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">Transaction Allowlist</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <div className="space-y-1">
                                            <div className="font-semibold">{precompileInfo.txAllowList.name}</div>
                                            <div className="text-xs font-mono">{precompileInfo.txAllowList.address}</div>
                                            <div className="text-xs">{precompileInfo.txAllowList.description}</div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <GreenSwitch checked={!!txConfig.activated} onCheckedChange={(c) => {
                                const isEnabled = !!c;
                                setTxConfig(prev => {
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
                                handleSwitchChange('txAllowListConfig', isEnabled);
                            }} />
                        </div>
                        {txConfig.activated && (
                            <div className="mt-2">
                                <AllowlistPrecompileConfigurator
                                    title=""
                                    description={compact ? '' : 'Addresses allowed to submit transactions'}
                                    precompileAction="submit transactions"
                                    config={txConfig}
                                    onUpdateConfig={setTxConfig}
                                    radioOptionFalseLabel=""
                                    radioOptionTrueLabel=""
                                    validationError={validationErrors.txAllowList}
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
