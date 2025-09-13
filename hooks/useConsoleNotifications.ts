import { useWalletStore } from '@/components/toolbox/stores/walletStore';
import { toast } from 'sonner';
import { useHistory } from './use-history';

// TO-DO move somewhere better
const getPChainTxExplorerURL = (txID: string, isTestnet: boolean) => {
    return `https://${isTestnet ? "subnets-test" : "subnets"}.avax.network/p-chain/tx/${txID}`;
}

const useConsoleNotifications = () => {
    // Handle SSR/SSG - only access store on client
    const isTestnet = typeof window !== 'undefined' ? useWalletStore((s) => s.isTestnet) : false;
    const { history, loading, addToHistory, clearHistory, getExplorerUrl, isUsingLocalStorage } = useHistory();

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
                addToHistory({
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
                addToHistory({
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
                addToHistory({
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
                addToHistory({
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
                addToHistory({
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
                addToHistory({
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

    return {
        sendCoreWalletNotSetNotification,
        sendCreateSubnetNotifications,
        sendCreateChainNotifications,
        sendConvertSubnetToL1Notifications,
        // History
        history,
        loading,
        clearHistory,
        getExplorerUrl,
        isUsingLocalStorage
    };
};

export default useConsoleNotifications;