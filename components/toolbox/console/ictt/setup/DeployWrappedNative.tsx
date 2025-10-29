"use client";

import WrappedNativeToken from "@/contracts/icm-contracts/compiled/WrappedNativeToken.json";
import { useViemChainStore } from "@/components/toolbox/stores/toolboxStore";
import { useWrappedNativeToken, useSetWrappedNativeToken } from "@/components/toolbox/stores/l1ListStore";
import { useWalletStore } from "@/components/toolbox/stores/walletStore";
import { useNativeCurrencyInfo, useSetNativeCurrencyInfo } from "@/components/toolbox/stores/l1ListStore";
import { useState, useEffect } from "react";
import { Button } from "@/components/toolbox/components/Button";
import { Success } from "@/components/toolbox/components/Success";
import { http, createPublicClient } from "viem";
import { useSelectedL1 } from "@/components/toolbox/stores/l1ListStore";
import { WalletRequirementsConfigKey } from "@/components/toolbox/hooks/useWalletRequirements";
import WrapNativeToken from "./wrappedNativeToken/WrapNativeToken";
import UnwrapNativeToken from "./wrappedNativeToken/UnwrapNativeToken";
import DisplayNativeBalance from "./wrappedNativeToken/DisplayNativeBalance";
import DisplayWrappedBalance from "./wrappedNativeToken/DisplayWrappedBalance";
import { BaseConsoleToolProps, ConsoleToolMetadata, withConsoleToolMetadata } from "../../../components/WithConsoleToolMetadata";
import { useConnectedWallet } from "@/components/toolbox/contexts/ConnectedWalletContext";
import useConsoleNotifications from "@/hooks/useConsoleNotifications";
import { generateConsoleToolGitHubUrl } from "@/components/toolbox/utils/github-url";

// Pre-deployed wrapped native token address (from genesis)
// This is the standard address used in the pre-installed contracts section
const PREDEPLOYED_WRAPPED_NATIVE_ADDRESS = '0x1111111111111111111111111111111111111111';

const metadata: ConsoleToolMetadata = {
    title: "Wrapped Native Token",
    description: "Deploy a wrapped native token or use the pre-deployed one to wrap/unwrap native tokens.",
    toolRequirements: [
        WalletRequirementsConfigKey.EVMChainBalance
    ],
    githubUrl: generateConsoleToolGitHubUrl(import.meta.url)
};

function DeployWrappedNative({ onSuccess }: BaseConsoleToolProps) {
    const [criticalError, setCriticalError] = useState<Error | null>(null);

    const setWrappedNativeToken = useSetWrappedNativeToken();
    const selectedL1 = useSelectedL1()();
    const [wrappedNativeTokenAddress, setLocalWrappedNativeTokenAddress] = useState<string>('');
    const [hasPredeployedToken, setHasPredeployedToken] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(false);
    const { coreWalletClient } = useConnectedWallet();
    const { walletEVMAddress, walletChainId } = useWalletStore();
    const setNativeCurrencyInfo = useSetNativeCurrencyInfo();
    const { notify } = useConsoleNotifications();
    const viemChain = useViemChainStore();
    const [isDeploying, setIsDeploying] = useState(false);
    
    // Get cached values from wallet store
    const cachedWrappedToken = useWrappedNativeToken();
    const cachedNativeCurrency = useNativeCurrencyInfo();
    
    // Get native token symbol (use cached value if available)
    const nativeTokenSymbol = cachedNativeCurrency?.symbol || viemChain?.nativeCurrency?.symbol || selectedL1?.coinName || 'COIN';
    const wrappedTokenSymbol = `W${nativeTokenSymbol}`;

    // Throw critical errors during render
    if (criticalError) {
        throw criticalError;
    }

    // Check for pre-deployed wrapped native token
    useEffect(() => {
        async function checkToken() {
            if (!viemChain || !walletEVMAddress) return;

            setIsCheckingToken(true);
            try {
                const chainIdStr = walletChainId.toString();
                
                // Cache native currency info if not already cached
                if (!cachedNativeCurrency && viemChain.nativeCurrency) {
                    setNativeCurrencyInfo(walletChainId, viemChain.nativeCurrency);
                }
                
                // Check cache first for wrapped token
                let tokenAddress = cachedWrappedToken || '';
                
                // If not in cache, check other sources
                if (!tokenAddress) {
                    if (selectedL1?.wrappedTokenAddress) {
                        tokenAddress = selectedL1.wrappedTokenAddress;
                    } else {
                        // Check if pre-deployed wrapped native token exists
                        const publicClient = createPublicClient({
                            transport: http(viemChain.rpcUrls.default.http[0] || "")
                        });
                        
                        const code = await publicClient.getBytecode({ address: PREDEPLOYED_WRAPPED_NATIVE_ADDRESS as `0x${string}` });
                        const hasPredeployed = code !== undefined && code !== '0x';
                        setHasPredeployedToken(hasPredeployed);
                        
                        if (hasPredeployed) {
                            tokenAddress = PREDEPLOYED_WRAPPED_NATIVE_ADDRESS;
                        }
                    }
                    
                    // No need to cache here since we're using toolboxStore
                } else {
                    // If we got from cache, we assume it exists
                    setHasPredeployedToken(true);
                }

                setLocalWrappedNativeTokenAddress(tokenAddress);
                
                // If we detected pre-deployed token and nothing in store, save it
                if (tokenAddress === PREDEPLOYED_WRAPPED_NATIVE_ADDRESS && !selectedL1?.wrappedTokenAddress) {
                    setWrappedNativeToken(PREDEPLOYED_WRAPPED_NATIVE_ADDRESS);
                }
            } catch (error) {
                console.error('Error checking token:', error);
            } finally {
                setIsCheckingToken(false);
            }
        }

        checkToken();
    }, [viemChain, walletEVMAddress, selectedL1, walletChainId, cachedWrappedToken, cachedNativeCurrency, setNativeCurrencyInfo]);

    async function handleDeploy() {
        setIsDeploying(true);
        try {
            if (!viemChain) throw new Error("No chain selected");

            const publicClient = createPublicClient({
                transport: http(viemChain.rpcUrls.default.http[0] || "")
            });

            const deployPromise = coreWalletClient.deployContract({
                abi: WrappedNativeToken.abi as any,
                bytecode: WrappedNativeToken.bytecode.object as `0x${string}`,
                args: ["WNT"],
                chain: viemChain,
                account: walletEVMAddress as `0x${string}`
            });
            notify({
                type: 'deploy',
                name: 'WrappedNativeToken'
            }, deployPromise, viemChain ?? undefined);

            const receipt = await publicClient.waitForTransactionReceipt({ hash: await deployPromise });

            if (!receipt.contractAddress) {
                throw new Error('No contract address in receipt');
            }

            setWrappedNativeToken(receipt.contractAddress);
            setLocalWrappedNativeTokenAddress(receipt.contractAddress);
        } catch (error) {
            setCriticalError(error instanceof Error ? error : new Error(String(error)));
        } finally {
            setIsDeploying(false);
        }
    }


    return (
        <div className="space-y-6">
            {isCheckingToken ? (
                <div className="text-center py-8 text-zinc-500">
                    Checking for wrapped native token...
                </div>
            ) : (
                <>
                    {/* Token Address Display */}
                    {wrappedNativeTokenAddress && (
                        <Success
                            label={`Wrapped Native Token Address (${wrappedTokenSymbol})`}
                            value={wrappedNativeTokenAddress}
                        />
                    )}

                    {/* Deploy Section - Only show if no wrapped token exists */}
                    {!wrappedNativeTokenAddress && (
                        <div className="space-y-4">
                            <div>
                                {hasPredeployedToken ? (
                                    <div className="space-y-2">
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            ✓ Pre-deployed wrapped native token detected at {PREDEPLOYED_WRAPPED_NATIVE_ADDRESS}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            This token wraps your L1's native token ({nativeTokenSymbol} → {wrappedTokenSymbol})
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        No wrapped native token found. Deploy one to enable wrapping functionality.
                                    </p>
                                )}
                            </div>
                            
                            <Button
                                variant="primary"
                                onClick={handleDeploy}
                                loading={isDeploying}
                                disabled={isDeploying}
                            >
                                Deploy Wrapped Native Token
                            </Button>
                        </div>
                    )}

                    {/* Independent Tools Section - Only show if wrapped token exists */}
                    {wrappedNativeTokenAddress && (
                        <div className="space-y-6">
                            {/* Balance Display Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DisplayNativeBalance
                                    onError={setCriticalError}
                                />
                                <DisplayWrappedBalance
                                    wrappedNativeTokenAddress={wrappedNativeTokenAddress}
                                    onError={setCriticalError}
                                />
                            </div>
                            
                            {/* Wrap/Unwrap Tools Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <WrapNativeToken
                                    wrappedNativeTokenAddress={wrappedNativeTokenAddress}
                                    onError={setCriticalError}
                                />
                                <UnwrapNativeToken
                                    wrappedNativeTokenAddress={wrappedNativeTokenAddress}
                                    onError={setCriticalError}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default withConsoleToolMetadata(DeployWrappedNative, metadata);
