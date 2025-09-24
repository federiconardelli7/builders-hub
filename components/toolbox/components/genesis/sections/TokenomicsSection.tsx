import { Dispatch, SetStateAction } from 'react';
import { SectionWrapper } from '../SectionWrapper';
import { Input } from '../../Input';
import TokenAllocationList from '../TokenAllocationList';
import AllowlistPrecompileConfigurator from '../AllowlistPrecompileConfigurator';
import { AllocationEntry, AllowlistPrecompileConfig } from '../types';
import { useGenesisHighlight } from '../GenesisHighlightContext';

type TokenomicsSectionProps = {
    tokenAllocations: AllocationEntry[];
    setTokenAllocations: (allocations: AllocationEntry[]) => void;
    nativeMinterConfig: AllowlistPrecompileConfig;
    setNativeMinterConfig: Dispatch<SetStateAction<AllowlistPrecompileConfig>>;
    tokenName: string;
    setTokenName: Dispatch<SetStateAction<string>>;
    isExpanded: boolean;
    toggleExpand: () => void;
    validationErrors: { [key: string]: string };
    compact?: boolean;
    hideMinterConfigurator?: boolean;
};

export const TokenomicsSection = ({
    tokenAllocations,
    setTokenAllocations,
    nativeMinterConfig,
    setNativeMinterConfig,
    tokenName,
    setTokenName,
    isExpanded,
    toggleExpand,
    validationErrors, // Pass errors object
    compact,
    hideMinterConfigurator = false
}: TokenomicsSectionProps) => {
    const { setHighlightPath, clearHighlight } = useGenesisHighlight();

    const handleFocus = (path: string) => {
        setHighlightPath(path);
    };

    const handleBlur = () => {
        clearHighlight();
    };
    return (
        // <SectionWrapper
        //     title="Tokenomics"
        //     description={compact ? "" : "Configure allocations and optional minting for your native token."}
        //     isExpanded={isExpanded}
        //     toggleExpand={toggleExpand}
        //     sectionId="tokenomics"
        //     compact={compact}
        //     variant="flat"
        // >
            <div className="space-y-6 text-[13px]">

                 {/* Initial Allocation */} 
                 <div>
                    <TokenAllocationList
                        allocations={tokenAllocations}
                        onAllocationsChange={setTokenAllocations}
                        compact={compact}
                    />
                    {validationErrors.tokenAllocations && <p className="text-red-500 text-sm mt-1">{validationErrors.tokenAllocations}</p>}
                </div>
                
                {/* Coin Name - match EVM Chain ID styling (simple labeled input) */}
                <Input
                    label="Coin Name"
                    value={tokenName}
                    onChange={setTokenName}
                    placeholder="COIN"
                    onFocus={() => handleFocus('tokenName')}
                    onBlur={handleBlur}
                />

                {!hideMinterConfigurator && (
                    <div>
                        <AllowlistPrecompileConfigurator
                            title="Minting Rights of Native Token"
                            description={compact ? "" : "Configure which addresses can mint additional native tokens."}
                            precompileAction="mint native tokens"
                            config={nativeMinterConfig}
                            onUpdateConfig={setNativeMinterConfig}
                            radioOptionFalseLabel="Fixed token supply."
                            radioOptionTrueLabel="Allow minting additional tokens."
                            validationError={validationErrors.contractNativeMinter}
                        />
                    </div>
                )}
            </div>
        // </SectionWrapper>
    );
}; 