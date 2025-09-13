import { toast } from 'sonner';

// TO-DO move somewhere better
const getPChainTxExplorerURL = (txID: string, isTestnet: boolean) => {
    return `https://${isTestnet ? "subnets-test" : "subnets"}.avax.network/p-chain/tx/${txID}`;
}

const useConsoleNotifications = () => {

    // TO-DO this should not be a thing. Core wallet should not be possible to be not set
    const sendCoreWalletNotSetNotification = () => {
        toast.error('Core wallet not set');
    }

    const sendCreateSubnetNotifications = (createSubnetTx: Promise<string>, isTestnet: boolean) => {
        toast.promise(createSubnetTx, {
            loading: 'Creating Subnet...',
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
                // TO-DO Add to History
            })
            .catch((error) => {
                // TO-DO Add to History Error
            });
    };

    const sendCreateChainNotifications = (createChainTx: Promise<string>, isTestnet: boolean) => {
        toast.promise(createChainTx, {
            loading: 'Creating Chain...',
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
                // TO-DO Add to History
            })
            .catch((error) => {
                // TO-DO Add to History Error
            });
    };

    return {
        sendCoreWalletNotSetNotification,
        sendCreateSubnetNotifications,
        sendCreateChainNotifications,
    };
};

export default useConsoleNotifications;