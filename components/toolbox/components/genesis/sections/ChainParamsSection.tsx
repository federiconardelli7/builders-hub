import { Dispatch, SetStateAction } from 'react';
import { SectionWrapper } from '../SectionWrapper';
import { Input } from '../../Input';
import { Select } from '../../Select';
import { useGenesisHighlight } from '../GenesisHighlightContext';

type ChainParamsSectionProps = {
    evmChainId: number;
    setEvmChainId: Dispatch<SetStateAction<number>>;
    vmId?: string;
    setVmId?: Dispatch<SetStateAction<string>>;
    tokenName: string;
    setTokenName: Dispatch<SetStateAction<string>>;
    tokenSymbol: string;
    setTokenSymbol: Dispatch<SetStateAction<string>>;
    isExpanded: boolean;
    toggleExpand: () => void;
    validationError?: string;
    tokenNameError?: string;
    tokenSymbolError?: string;
    compact?: boolean;
    hideTokenFields?: boolean;
};

export const ChainParamsSection = ({
    evmChainId,
    setEvmChainId,
    vmId,
    setVmId,
    tokenName,
    setTokenName,
    tokenSymbol,
    setTokenSymbol,
    isExpanded,
    toggleExpand,
    validationError,
    tokenNameError,
    tokenSymbolError,
    compact,
    hideTokenFields
}: ChainParamsSectionProps) => {
    const { setHighlightPath, clearHighlight } = useGenesisHighlight();

    const handleFocus = (path: string) => {
        setHighlightPath(path);
    };

    const handleBlur = () => {
        clearHighlight();
    };
    return (
        // <SectionWrapper
        //     title="Chain Parameters"
        //     description={compact ? "" : "Configure the basic parameters of your L1 blockchain."}
        //     isExpanded={isExpanded}
        //     toggleExpand={toggleExpand}
        //     sectionId="chainParams"
        //     compact={compact}
        //     variant="flat"
        // >
            <div className="space-y-2 text-[13px]">
                {/* Chain Name handled outside this section; this focuses on ID and VM */}
                <Input
                    label="EVM Chain ID"
                    value={evmChainId.toString()}
                    onChange={(value) => setEvmChainId(Number(value))}
                    placeholder="Enter chain ID"
                    type="number"
                    error={validationError}
                    onFocus={() => handleFocus('chainId')}
                    onBlur={handleBlur}
                />
                {!compact && (
                    <div className="-mt-1">
                        <a
                            href="https://chainlist.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700"
                        >
                            View registered chain IDs on chainlist.org →
                        </a>
                    </div>
                )}
                
                {!hideTokenFields && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Token Name (Optional)"
                            value={tokenName}
                            onChange={setTokenName}
                            placeholder="Default: COIN"
                            error={tokenNameError}
                            helperText={tokenNameError ? undefined : (compact ? undefined : "Full name of your native token (defaults to COIN if empty)")}
                            onFocus={() => handleFocus('tokenName')}
                            onBlur={handleBlur}
                        />
                        <Input
                            label="Token Symbol (Optional)"
                            value={tokenSymbol}
                            onChange={setTokenSymbol}
                            placeholder="Default: COIN"
                            error={tokenSymbolError}
                            helperText={tokenSymbolError ? undefined : (compact ? undefined : "Short symbol for your native token (defaults to COIN if empty)")}
                            onFocus={() => handleFocus('tokenSymbol')}
                            onBlur={handleBlur}
                        />
                    </div>
                )}
            </div>
        // </SectionWrapper>
    );
}; 
