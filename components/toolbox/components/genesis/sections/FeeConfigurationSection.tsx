import { Dispatch, SetStateAction, useMemo } from 'react';
import { Address } from 'viem';
import { SectionWrapper } from '../SectionWrapper';
import FeeConfig from '../FeeConfig';
import { FeeConfigType, ValidationMessages, AllowlistPrecompileConfig } from '../types';
import AllowlistPrecompileConfigurator from '../AllowlistPrecompileConfigurator';
import { useGenesisHighlight } from '../GenesisHighlightContext';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type FeeConfigurationSectionProps = {
    gasLimit: number;
    setGasLimit: Dispatch<SetStateAction<number>>;
    targetBlockRate: number;
    setTargetBlockRate: Dispatch<SetStateAction<number>>;
    feeConfig: FeeConfigType;
    setFeeConfig: Dispatch<SetStateAction<FeeConfigType>>;
    feeManagerConfig: AllowlistPrecompileConfig;
    setFeeManagerConfig: Dispatch<SetStateAction<AllowlistPrecompileConfig>>;
    rewardManagerConfig: AllowlistPrecompileConfig;
    setRewardManagerConfig: Dispatch<SetStateAction<AllowlistPrecompileConfig>>;
    isExpanded: boolean;
    toggleExpand: () => void;
    validationMessages: ValidationMessages;
    compact?: boolean;
    walletAddress?: Address;
};

export const FeeConfigurationSection = ({
    gasLimit,
    setGasLimit,
    targetBlockRate,
    setTargetBlockRate,
    feeConfig,
    setFeeConfig,
    feeManagerConfig,
    setFeeManagerConfig,
    rewardManagerConfig,
    setRewardManagerConfig,
    isExpanded,
    toggleExpand,
    validationMessages,
    compact,
    walletAddress
}: FeeConfigurationSectionProps) => {
    const { setHighlightPath, clearHighlight } = useGenesisHighlight();

    // Combine specific errors/warnings for FeeConfig component
    const feeConfigValidation = useMemo(() => ({
        errors: {
            gasLimit: validationMessages.errors.gasLimit,
            blockRate: validationMessages.errors.blockRate,
            minBaseFee: validationMessages.errors.minBaseFee,
            targetGas: validationMessages.errors.targetGas,
            baseFeeChangeDenominator: validationMessages.errors.baseFeeChangeDenominator,
            minBlockGasCost: validationMessages.errors.minBlockGasCost,
            maxBlockGasCost: validationMessages.errors.maxBlockGasCost,
            feeManager: validationMessages.errors.feeManager
        },
        warnings: {
            gasLimit: validationMessages.warnings.gasLimit,
            blockRate: validationMessages.warnings.blockRate,
            minBaseFee: validationMessages.warnings.minBaseFee,
            targetGas: validationMessages.warnings.targetGas,
            baseFeeChangeDenominator: validationMessages.warnings.baseFeeChangeDenominator,
            minBlockGasCost: validationMessages.warnings.minBlockGasCost,
            maxBlockGasCost: validationMessages.warnings.maxBlockGasCost,
            blockGasCostStep: validationMessages.warnings.blockGasCostStep
        }
    }), [validationMessages]);

    // Precompile info
    const precompileInfo = {
        feeManager: {
            address: '0x0200000000000000000000000000000000000003',
            name: 'Fee Manager',
            description: 'Enables dynamic fee configuration adjustments by authorized admins without requiring a hard fork.'
        },
        rewardManager: {
            address: '0x0200000000000000000000000000000000000004',
            name: 'Reward Manager',
            description: 'Manages validator rewards and fee recipient configuration for block producers.'
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
                setTimeout(() => clearHighlight(), 2000);
            }, 400);
        }
    };


    return (
        <SectionWrapper
            title="Fee Configuration"
            description={compact ? "" : "Configure fee parameters and dynamic managers."}
            titleTooltip="Set transaction fees and gas parameters for your blockchain. You can also enable dynamic fee management to adjust fees after launch without requiring network upgrades."
            titleTooltipLink={{ href: "/docs/avalanche-l1s/evm-configuration/transaction-fees", text: "Learn more about transaction fees" }}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            sectionId="transactionFees"
            compact={compact}
            variant="flat"
        >
            {/* Pass all necessary props to FeeConfig */}
            <FeeConfig
                gasLimit={gasLimit}
                setGasLimit={setGasLimit}
                targetBlockRate={targetBlockRate}
                setTargetBlockRate={setTargetBlockRate}
                feeConfig={feeConfig}
                onFeeConfigChange={setFeeConfig}
                validationMessages={feeConfigValidation}
            />

            {/* Fee Manager and Reward Manager */}
            <div className="space-y-3 mt-4"> 
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
                    {/* Fee Manager */}
                    <div className="px-3 py-2 text-[12px] bg-white dark:bg-zinc-950">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">Fee Manager</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <div className="space-y-1">
                                            <div className="font-semibold">{precompileInfo.feeManager.name}</div>
                                            <div className="text-xs font-mono">{precompileInfo.feeManager.address}</div>
                                            <div className="text-xs">{precompileInfo.feeManager.description}</div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <GreenSwitch checked={!!feeManagerConfig.activated} onCheckedChange={(c) => {
                                const isEnabled = !!c;
                                setFeeManagerConfig(prev => {
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
                                handleSwitchChange('feeManagerAddress', isEnabled);
                            }} />
                        </div>
                        {feeManagerConfig.activated && (
                            <div className="mt-2">
                                <AllowlistPrecompileConfigurator
                                    title=""
                                    description={compact ? '' : 'Addresses allowed to manage fee configuration'}
                                    precompileAction="manage fee configuration"
                                    config={feeManagerConfig}
                                    onUpdateConfig={setFeeManagerConfig}
                                    radioOptionFalseLabel=""
                                    radioOptionTrueLabel=""
                                    validationError={validationMessages.errors.feeManager}
                                    showActivationToggle={false}
                                />
                            </div>
                        )}
                    </div>

                    {/* Reward Manager */}
                    <div className="px-3 py-2 text-[12px] bg-white dark:bg-zinc-950">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">Reward Manager</span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <div className="space-y-1">
                                            <div className="font-semibold">{precompileInfo.rewardManager.name}</div>
                                            <div className="text-xs font-mono">{precompileInfo.rewardManager.address}</div>
                                            <div className="text-xs">{precompileInfo.rewardManager.description}</div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <GreenSwitch checked={!!rewardManagerConfig.activated} onCheckedChange={(c) => {
                                const isEnabled = !!c;
                                setRewardManagerConfig(prev => {
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
                                handleSwitchChange('rewardManagerAddress', isEnabled);
                            }} />
                        </div>
                        {rewardManagerConfig.activated && (
                            <div className="mt-2">
                                <AllowlistPrecompileConfigurator
                                    title=""
                                    description={compact ? '' : 'Addresses allowed to manage rewards'}
                                    precompileAction="manage rewards"
                                    config={rewardManagerConfig}
                                    onUpdateConfig={setRewardManagerConfig}
                                    radioOptionFalseLabel=""
                                    radioOptionTrueLabel=""
                                    validationError={validationMessages.errors.rewardManager}
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
