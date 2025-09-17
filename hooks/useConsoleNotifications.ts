import { useWalletStore } from '@/components/toolbox/stores/walletStore';
import { toast } from 'sonner';
import { useConsoleLog } from './use-console-log';
import { Chain } from 'viem';
import usePChainNotifications from './usePChainNotifications';
import useEVMNotifications from './useEVMNotifications';
import { type PChainAction } from './usePChainNotifications';
import { type EVMAction } from './useEVMNotifications';

type ConsoleAction = PChainAction | EVMAction;

const useConsoleNotifications = () => {
    const { logs, loading, getExplorerUrl } = useConsoleLog();
    const notifyP = usePChainNotifications();
    const notifyE = useEVMNotifications();

    // TO-DO this should not be a thing. Core wallet should not be possible to be not set
    const sendCoreWalletNotSetNotification = () => {
        toast.error('Core wallet not set');
    }

    const notify = <T>(action: ConsoleAction, promise: Promise<T>, viemChain?: Chain) => {
        if (['createSubnet', 'createChain', 'convertToL1'].includes(action)) {
            notifyP(action as PChainAction, promise as Promise<string>);
        } else {
            if (!viemChain && action !== 'aggregateSignatures') {
                throw new Error('viemChain is required for EVM actions');
            }
            notifyE(action as EVMAction, promise, viemChain);
        }
    };

    return {
        sendCoreWalletNotSetNotification,
        notify,
        logs,
        loading,
        getExplorerUrl
    };
};

export default useConsoleNotifications;