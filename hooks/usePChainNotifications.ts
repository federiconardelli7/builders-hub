import { useWalletStore } from '@/components/toolbox/stores/walletStore';
import { toast } from 'sonner';
import { useConsoleLog } from './use-console-log';
import { PChainClient, createPChainClient } from '@avalanche-sdk/client';
import { avalanche, avalancheFuji } from '@avalanche-sdk/client/chains';

const getPChainTxExplorerURL = (txID: string, isTestnet: boolean) => {
    return `https://${isTestnet ? "subnets-test" : "subnets"}.avax.network/p-chain/tx/${txID}`;
};

export type PChainAction = 'createSubnet' | 'createChain' | 'convertToL1';

type PChainNotificationConfig = {
    loadingMessage: string;
    successMessage: string;
    errorMessagePrefix: string;
    eventType: string;
};

const configs: Record<PChainAction, PChainNotificationConfig> = {
    createSubnet: {
        loadingMessage: 'Signing CreateSubnetTx with Core...',
        successMessage: 'Subnet created successfully',
        errorMessagePrefix: 'Failed to create Subnet: ',
        eventType: 'subnet_created',
    },
    createChain: {
        loadingMessage: 'Signing CreateChainTx with Core...',
        successMessage: 'Chain created successfully',
        errorMessagePrefix: 'Failed to create Chain: ',
        eventType: 'chain_created',
    },
    convertToL1: {
        loadingMessage: 'Signing ConvertSubnetToL1Tx with Core...',
        successMessage: 'Subnet converted to L1 successfully',
        errorMessagePrefix: 'Failed to convert Subnet to L1: ',
        eventType: 'l1_conversion',
    },
};

const waitForTransaction = async (client: PChainClient, txID: string, maxAttempts = 30, interval = 2000) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const receipt = await client.getTxStatus({ txID });
        if (receipt.status === 'Committed') {
            return true;
        } else if (receipt.status === 'Dropped') {
            throw new Error(`Transaction ${receipt.status}`);
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Transaction confirmation timeout');
};

const usePChainNotifications = () => {
    const isTestnet = typeof window !== 'undefined' ? useWalletStore((s) => s.isTestnet) : false;
    const { addLog } = useConsoleLog();

    const client: PChainClient = createPChainClient({ chain: isTestnet ? avalancheFuji : avalanche, transport: { type: 'http' } });

    const notifyPChain = (action: PChainAction, promise: Promise<string>) => {
        const config = configs[action];

        const toastId = toast.loading(config.loadingMessage);

        promise
            .then(async (txID) => {
                toast.loading('Waiting for transaction confirmation...', { id: toastId });

                try {
                    await waitForTransaction(client, txID);
                    toast.success(`${config.successMessage} (Confirmed)`, {
                        id: toastId,
                        action: {
                            label: 'Open in Explorer',
                            onClick: () => window.open(getPChainTxExplorerURL(txID, isTestnet), '_blank')
                        }
                    });

                    const data = action === 'createChain' 
                        ? { txID, blockchainID: txID, network: isTestnet ? 'testnet' : 'mainnet' }
                        : { txID, network: isTestnet ? 'testnet' : 'mainnet' };
                    addLog({
                        status: 'success',
                        eventType: config.eventType,
                        data
                    });
                } catch (error) {
                    toast.error(config.errorMessagePrefix + (error as Error).message, { id: toastId });
                    addLog({
                        status: 'error',
                        eventType: config.eventType,
                        data: { error: (error as Error).message, network: isTestnet ? 'testnet' : 'mainnet' }
                    });
                }
            })
            .catch((error) => {
                toast.error(config.errorMessagePrefix + error.message, { id: toastId });
                addLog({
                    status: 'error',
                    eventType: config.eventType,
                    data: { error: error.message, network: isTestnet ? 'testnet' : 'mainnet' }
                });
            });
    };

    return notifyPChain;
};

export default usePChainNotifications;
