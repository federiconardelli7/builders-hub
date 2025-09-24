import { Dispatch, SetStateAction } from 'react';
import { Input } from '../../Input';
import TokenAllocationList from '../TokenAllocationList';
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
}: TokenomicsSectionProps) => {
    const { setHighlightPath, clearHighlight } = useGenesisHighlight();

    const handleFocus = (path: string) => {
        setHighlightPath(path);
    };

    const handleBlur = () => {
        clearHighlight();
    };
    return (
            <div className="space-y-6 text-[13px]">

                 {/* Initial Allocation */} 
                 <Input
                    label="Token Name"
                    value={tokenName}
                    onChange={setTokenName}
                    placeholder="COIN"
                    onFocus={() => handleFocus('tokenName')}
                    onBlur={handleBlur}
                />
                 <div>
                    <TokenAllocationList
                        allocations={tokenAllocations}
                        onAllocationsChange={setTokenAllocations}
                        compact={compact}
                    />
                    {validationErrors.tokenAllocations && <p className="text-red-500 text-sm mt-1">{validationErrors.tokenAllocations}</p>}
                </div>
            </div>
    );
}; 