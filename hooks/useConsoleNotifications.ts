import { useWalletStore } from '@/components/toolbox/stores/walletStore';
import { toast } from 'sonner';
import { useConsoleLog } from './use-console-log';
import { Chain } from 'viem';

// TO-DO move somewhere better
const getPChainTxExplorerURL = (txID: string, isTestnet: boolean) => {
    return `https://${isTestnet ? "subnets-test" : "subnets"}.avax.network/p-chain/tx/${txID}`;
}

const getEVMExplorerUrl = (txHash: string, viemChain: Chain) => {
    if (viemChain.blockExplorers?.default?.url) {
        return `${viemChain.blockExplorers.default.url}/tx/${txHash}`;
    } else if (viemChain.id === 43114 || viemChain.id === 43113) {
        return `https://${viemChain.id === 43113 ? "subnets-test" : "subnets"}.avax.network/c-chain/tx/${txHash}`;
    } else {
        const rpcUrl = viemChain.rpcUrls.default.http[0];
        return `https://devnet.routescan.io/tx/${txHash}?rpc=${rpcUrl}`;
    }
};

const useConsoleNotifications = () => {
    // Handle SSR/SSG - only access store on client
    const isTestnet = typeof window !== 'undefined' ? useWalletStore((s) => s.isTestnet) : false;
    const { logs, loading, addLog, getExplorerUrl } = useConsoleLog();

    // TO-DO this should not be a thing. Core wallet should not be possible to be not set
    const sendCoreWalletNotSetNotification = () => {
        toast.error('Core wallet not set');
    }

    const sendCreateSubnetNotifications = (createSubnetTx: Promise<string>) => {
        toast.promise(createSubnetTx, {
            loading: 'Signing CreateSubnetTx with Core...',
            success: (txID: string) => ({
                message: 'Subnet created successfully',
                action: {
                    label: 'Open in Explorer',
                    onClick: () => window.open(getPChainTxExplorerURL(txID, isTestnet), '_blank')
                }
            }),
            error: (error) => 'Failed to create Subnet: ' + error.message,
        });

        createSubnetTx
            .then((txID) => {
                addLog({
                    title: 'Subnet Created',
                    description: `Transaction ID: ${txID}`,
                    status: 'success',
                    eventType: 'subnet_created',
                    data: { 
                        txID,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'Subnet Creation Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'subnet_created',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendCreateChainNotifications = (createChainTx: Promise<string>) => {
        toast.promise(createChainTx, {
            loading: 'Signing CreateChainTx with Core...',
            success: (txID: string) => ({
                message: 'Chain created successfully',
                action: {
                    label: 'Open in Explorer',
                    onClick: () => window.open(getPChainTxExplorerURL(txID, isTestnet), '_blank')
                }
            }),
            error: (error) => 'Failed to create Chain: ' + error.message,
        });

        createChainTx
            .then((txID) => {
                addLog({
                    title: 'Chain Created',
                    description: `Transaction ID: ${txID}`,
                    status: 'success',
                    eventType: 'chain_created',
                    data: { 
                        txID,
                        blockchainID: txID,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'Chain Creation Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'chain_created',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendConvertSubnetToL1Notifications = (convertSubnetToL1Tx: Promise<string>) => {
        toast.promise(convertSubnetToL1Tx, {
            loading: 'Signing ConvertSubnetToL1Tx with Core...',
            success: (txID: string) => ({
                message: 'Subnet converted to L1 successfully',
                action: {
                    label: 'Open in Explorer',
                    onClick: () => window.open(getPChainTxExplorerURL(txID, isTestnet), '_blank')
                }
            }),
            error: (error) => 'Failed to convert Subnet to L1: ' + error.message,
        });

        convertSubnetToL1Tx
            .then((txID) => {
                addLog({
                    title: 'Subnet Converted to L1',
                    description: `Transaction ID: ${txID}`,
                    status: 'success',
                    eventType: 'l1_conversion',
                    data: { 
                        txID,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'L1 Conversion Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'l1_conversion',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendDeployValidatorMessagesNotifications = (deployPromise: Promise<{hash: string; address: string}>, viemChain: Chain) => {
        toast.promise(deployPromise, {
            loading: 'Deploying ValidatorMessages library...',
            success: (data) => {
                return {
                    message: `ValidatorMessages library deployed`,
                    action: {
                        label: 'Open in Explorer',
                        onClick: () => window.open(getEVMExplorerUrl(data.hash, viemChain), '_blank')
                    }
                };
            },
            error: (error) => 'Failed to deploy ValidatorMessages library: ' + error.message,
        });

        deployPromise
            .then((data) => {
                addLog({
                    title: 'ValidatorMessages Library Deployed',
                    description: `Transaction Hash: ${data.hash}\nAddress: ${data.address}`,
                    status: 'success',
                    eventType: 'validator_messages_deployed',
                    data: { 
                        txHash: data.hash,
                        address: data.address,
                        chainId: viemChain.id,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'ValidatorMessages Deployment Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'validator_messages_deployed',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendDeployValidatorManagerNotifications = (deployPromise: Promise<{hash: string; address: string}>, viemChain: Chain) => {
        toast.promise(deployPromise, {
            loading: 'Deploying ValidatorManager contract...',
            success: (data) => {
                return {
                    message: `ValidatorManager contract deployed`,
                    action: {
                        label: 'Open in Explorer',
                        onClick: () => window.open(getEVMExplorerUrl(data.hash, viemChain), '_blank')
                    }
                };
            },
            error: (error) => 'Failed to deploy ValidatorManager contract: ' + error.message,
        });

        deployPromise
            .then((data) => {
                addLog({
                    title: 'ValidatorManager Contract Deployed',
                    description: `Transaction Hash: ${data.hash}\nAddress: ${data.address}`,
                    status: 'success',
                    eventType: 'validator_manager_deployed',
                    data: { 
                        txHash: data.hash,
                        address: data.address,
                        chainId: viemChain.id,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'ValidatorManager Deployment Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'validator_manager_deployed',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendDeployProxyAdminNotifications = (deployPromise: Promise<{hash: string; address: string}>, viemChain: Chain) => {
        toast.promise(deployPromise, {
            loading: 'Deploying ProxyAdmin contract...',
            success: (data) => ({
                message: `ProxyAdmin contract deployed`,
                action: {
                    label: 'Open in Explorer',
                    onClick: () => window.open(getEVMExplorerUrl(data.hash, viemChain), '_blank')
                }
            }),
            error: (error) => 'Failed to deploy ProxyAdmin contract: ' + error.message,
        });

        deployPromise
            .then((data) => {
                addLog({
                    title: 'ProxyAdmin Contract Deployed',
                    description: `Transaction Hash: ${data.hash}\nAddress: ${data.address}`,
                    status: 'success',
                    eventType: 'proxy_admin_deployed',
                    data: { 
                        txHash: data.hash,
                        address: data.address,
                        chainId: viemChain.id,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'ProxyAdmin Deployment Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'proxy_admin_deployed',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendDeployTransparentProxyNotifications = (deployPromise: Promise<{hash: string; address: string}>, viemChain: Chain) => {
        toast.promise(deployPromise, {
            loading: 'Deploying TransparentUpgradeableProxy contract...',
            success: (data) => ({
                message: `TransparentUpgradeableProxy contract deployed`,
                action: {
                    label: 'Open in Explorer',
                    onClick: () => window.open(getEVMExplorerUrl(data.hash, viemChain), '_blank')
                }
            }),
            error: (error) => 'Failed to deploy TransparentUpgradeableProxy contract: ' + error.message,
        });

        deployPromise
            .then((data) => {
                addLog({
                    title: 'TransparentUpgradeableProxy Contract Deployed',
                    description: `Transaction Hash: ${data.hash}\nAddress: ${data.address}`,
                    status: 'success',
                    eventType: 'transparent_proxy_deployed',
                    data: { 
                        txHash: data.hash,
                        address: data.address,
                        chainId: viemChain.id,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'TransparentUpgradeableProxy Deployment Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'transparent_proxy_deployed',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendUpgradeProxyNotifications = (upgradePromise: Promise<string>, viemChain: Chain) => {
        toast.promise(upgradePromise, {
            loading: 'Upgrading proxy...',
            success: (hash: string) => ({
                message: `Proxy upgraded successfully`,
                action: {
                    label: 'Open in Explorer',
                    onClick: () => window.open(getEVMExplorerUrl(hash, viemChain), '_blank')
                }
            }),
            error: (error) => 'Failed to upgrade proxy: ' + error.message,
        });

        upgradePromise
            .then((hash) => {
                addLog({
                    title: 'Proxy Upgraded',
                    description: `Transaction Hash: ${hash}`,
                    status: 'success',
                    eventType: 'proxy_upgraded',
                    data: { 
                        txHash: hash,
                        chainId: viemChain.id,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'Proxy Upgrade Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'proxy_upgraded',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendInitializeNotifications = (initPromise: Promise<string>, viemChain: Chain) => {
        toast.promise(initPromise, {
            loading: 'Initializing ValidatorManager...',
            success: (hash: string) => ({
                message: `ValidatorManager initialized successfully`,
                action: {
                    label: 'Open in Explorer',
                    onClick: () => window.open(getEVMExplorerUrl(hash, viemChain), '_blank')
                }
            }),
            error: (error) => 'Failed to initialize ValidatorManager: ' + error.message,
        });

        initPromise
            .then((hash) => {
                addLog({
                    title: 'ValidatorManager Initialized',
                    description: `Transaction Hash: ${hash}`,
                    status: 'success',
                    eventType: 'validator_manager_initialized',
                    data: { 
                        txHash: hash,
                        chainId: viemChain.id,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'ValidatorManager Initialization Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'validator_manager_initialized',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendInitializeValidatorSetNotifications = (initPromise: Promise<string>, viemChain: Chain) => {
        toast.promise(initPromise, {
            loading: 'Initializing validator set...',
            success: (hash: string) => ({
                message: `Validator set initialized successfully`,
                action: {
                    label: 'Open in Explorer',
                    onClick: () => window.open(getEVMExplorerUrl(hash, viemChain), '_blank')
                }
            }),
            error: (error) => 'Failed to initialize validator set: ' + error.message,
        });

        initPromise
            .then((hash) => {
                addLog({
                    title: 'Validator Set Initialized',
                    description: `Transaction Hash: ${hash}`,
                    status: 'success',
                    eventType: 'validator_set_initialized',
                    data: { 
                        txHash: hash,
                        chainId: viemChain.id,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'Validator Set Initialization Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'validator_set_initialized',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    const sendAggregateSignaturesNotifications = (aggPromise: Promise<string>) => {
        toast.promise(aggPromise, {
            loading: 'Aggregating signatures...',
            success: (signedMessage: string) => `Signatures aggregated successfully`,
            error: (error) => 'Failed to aggregate signatures: ' + error.message,
        });

        aggPromise
            .then((signedMessage) => {
                addLog({
                    title: 'Signatures Aggregated',
                    description: `Signed Message: ${signedMessage.slice(0, 10)}...`,
                    status: 'success',
                    eventType: 'signatures_aggregated',
                    data: { 
                        signedMessage,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            })
            .catch((error) => {
                addLog({
                    title: 'Signature Aggregation Failed',
                    description: error.message,
                    status: 'error',
                    eventType: 'signatures_aggregated',
                    data: { 
                        error: error.message,
                        network: isTestnet ? 'testnet' : 'mainnet'
                    }
                });
            });
    };

    return {
        sendCoreWalletNotSetNotification,
        sendCreateSubnetNotifications,
        sendCreateChainNotifications,
        sendConvertSubnetToL1Notifications,
        sendDeployValidatorMessagesNotifications,
        sendDeployValidatorManagerNotifications,
        sendDeployProxyAdminNotifications,
        sendDeployTransparentProxyNotifications,
        sendUpgradeProxyNotifications,
        sendInitializeNotifications,
        sendInitializeValidatorSetNotifications,
        sendAggregateSignaturesNotifications,
        // Console Log Access
        logs,
        loading,
        getExplorerUrl
    };
};

export default useConsoleNotifications;