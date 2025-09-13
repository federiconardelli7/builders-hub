import { toast } from 'sonner';

const useConsoleNotifications = () => {

    // TO-DO move somewhere better
    const getPChainTxExplorerURL = (txID: string, isTestnet: boolean) => {
        return `https://${isTestnet ? "subnets-test" : "subnets"}.avax.network/p-chain/tx/${txID}`;
    }


    const sendCoreWalletNotSetNotification = () => {
        toast.error('Core wallet not set');
    }

    const sendCreateSubnetNotifications = (promise: Promise<string>, isTestnet: boolean) => {
        toast.promise(promise, {
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

        promise
            .then((txID) => {
                // TO-DO Add to History
            })
            .catch((error) => {
                // TO-DO Add to History Error
            });
    };

    const sendCreateChainNotifications = (promise: Promise<string>, isTestnet: boolean) => {
        toast.promise(promise, {
            loading: 'Creating chain...',
            success: (txID: string) => ({
                message: 'Chain created successfully',
                action: {
                    label: 'Open in Explorer',
                    onClick: () => window.open(getPChainTxExplorerURL(txID, isTestnet), '_blank')
                }
            }),
            error: (error) => 'Failed to create Chain: ' + error.message,
        });

        promise
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