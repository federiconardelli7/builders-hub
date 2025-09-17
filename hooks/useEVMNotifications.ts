import { useWalletStore } from '@/components/toolbox/stores/walletStore';
import { toast } from 'sonner';
import { useConsoleLog } from './use-console-log';
import { Chain, createPublicClient, http } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';

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

export type EVMAction = 
  | 'deployValidatorMessages'
  | 'deployValidatorManager'
  | 'deployProxyAdmin'
  | 'deployTransparentProxy'
  | 'upgradeProxy'
  | 'initialize'
  | 'initializeValidatorSet'
  | 'aggregateSignatures'
  | 'deployPoAManager'
  | 'transferOwnership'
  | 'deployTeleporterRegistry'
  | 'deployICMDemo'
  | 'sendICMMessage'
  | 'sendNativeCoin';

type EVMNotificationConfig = {
    loadingMessage: string;
    successMessage: string;
    errorMessagePrefix: string;
    eventType: string;
    needsConfirmation: boolean;
};

const configs: Record<EVMAction, EVMNotificationConfig> = {
    deployValidatorMessages: {
        loadingMessage: 'Deploying ValidatorMessages library...',
        successMessage: 'ValidatorMessages library deployed',
        errorMessagePrefix: 'Failed to deploy ValidatorMessages library: ',
        eventType: 'validator_messages_deployed',
        needsConfirmation: true,
    },
    deployValidatorManager: {
        loadingMessage: 'Deploying ValidatorManager contract...',
        successMessage: 'ValidatorManager contract deployed',
        errorMessagePrefix: 'Failed to deploy ValidatorManager contract: ',
        eventType: 'validator_manager_deployed',
        needsConfirmation: true,
    },
    deployProxyAdmin: {
        loadingMessage: 'Deploying ProxyAdmin contract...',
        successMessage: 'ProxyAdmin contract deployed',
        errorMessagePrefix: 'Failed to deploy ProxyAdmin contract: ',
        eventType: 'proxy_admin_deployed',
        needsConfirmation: true,
    },
    deployTransparentProxy: {
        loadingMessage: 'Deploying TransparentUpgradeableProxy contract...',
        successMessage: 'TransparentUpgradeableProxy contract deployed',
        errorMessagePrefix: 'Failed to deploy TransparentUpgradeableProxy contract: ',
        eventType: 'transparent_proxy_deployed',
        needsConfirmation: true,
    },
    upgradeProxy: {
        loadingMessage: 'Upgrading proxy...',
        successMessage: 'Proxy upgraded successfully',
        errorMessagePrefix: 'Failed to upgrade proxy: ',
        eventType: 'proxy_upgraded',
        needsConfirmation: true,
    },
    initialize: {
        loadingMessage: 'Initializing ValidatorManager...',
        successMessage: 'ValidatorManager initialized successfully',
        errorMessagePrefix: 'Failed to initialize ValidatorManager: ',
        eventType: 'validator_manager_initialized',
        needsConfirmation: true,
    },
    initializeValidatorSet: {
        loadingMessage: 'Initializing validator set...',
        successMessage: 'Validator set initialized successfully',
        errorMessagePrefix: 'Failed to initialize validator set: ',
        eventType: 'validator_set_initialized',
        needsConfirmation: true,
    },
    aggregateSignatures: {
        loadingMessage: 'Aggregating signatures...',
        successMessage: 'Signatures aggregated successfully',
        errorMessagePrefix: 'Failed to aggregate signatures: ',
        eventType: 'signatures_aggregated',
        needsConfirmation: false,
    },
    deployPoAManager: {
        loadingMessage: 'Deploying PoAManager contract...',
        successMessage: 'PoAManager contract deployed',
        errorMessagePrefix: 'Failed to deploy PoAManager contract: ',
        eventType: 'poa_manager_deployed',
        needsConfirmation: true,
    },
    transferOwnership: {
        loadingMessage: 'Transferring ownership...',
        successMessage: 'Ownership transferred successfully',
        errorMessagePrefix: 'Failed to transfer ownership: ',
        eventType: 'ownership_transferred',
        needsConfirmation: true,
    },
    deployTeleporterRegistry: {
        loadingMessage: 'Deploying TeleporterRegistry contract...',
        successMessage: 'TeleporterRegistry contract deployed',
        errorMessagePrefix: 'Failed to deploy TeleporterRegistry contract: ',
        eventType: 'teleporter_registry_deployed',
        needsConfirmation: true,
    },
    deployICMDemo: {
        loadingMessage: 'Deploying ICMDemo contract...',
        successMessage: 'ICMDemo contract deployed',
        errorMessagePrefix: 'Failed to deploy ICMDemo contract: ',
        eventType: 'icm_demo_deployed',
        needsConfirmation: true,
    },
    sendICMMessage: {
        loadingMessage: 'Sending ICM message...',
        successMessage: 'ICM message sent successfully',
        errorMessagePrefix: 'Failed to send ICM message: ',
        eventType: 'icm_message_sent',
        needsConfirmation: true,
    },
    sendNativeCoin: {
        loadingMessage: 'Sending native coin...',
        successMessage: 'Native coin sent successfully',
        errorMessagePrefix: 'Failed to send native coin: ',
        eventType: 'native_coin_sent',
        needsConfirmation: true,
    },
};

const useEVMNotifications = () => {
    const isTestnet = typeof window !== 'undefined' ? useWalletStore((s) => s.isTestnet) : false;
    const { addLog } = useConsoleLog();

    const notifyEVM = (action: EVMAction, promise: Promise<any>, viemChain?: Chain) => {
        const config = configs[action];

        const toastId = toast.loading(config.loadingMessage);

        promise
            .then(async (hash) => {
                let logData: Record<string, any>;
                let finalHash = hash;

                if (config.needsConfirmation && viemChain) {
                    toast.loading('Waiting for transaction confirmation...', { id: toastId });

                    const publicClient = createPublicClient({
                        chain: viemChain,
                        transport: http()
                    });
                    const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });

                    if (['deployValidatorMessages', 'deployValidatorManager', 'deployProxyAdmin', 'deployTransparentProxy'].includes(action)) {
                        if (!receipt.contractAddress) throw new Error('No contract address in receipt');
                        logData = { txHash: hash, address: receipt.contractAddress, chainId: viemChain.id, network: isTestnet ? 'testnet' : 'mainnet' };
                    } else {
                        logData = { txHash: hash, chainId: viemChain.id, network: isTestnet ? 'testnet' : 'mainnet' };
                    }
                } else {
                    logData = { result: hash, network: isTestnet ? 'testnet' : 'mainnet' };
                }

                toast.success(`${config.successMessage} (Confirmed)`, {
                    id: toastId,
                    action: {
                        label: 'Open in Explorer',
                        onClick: () => window.open(getEVMExplorerUrl(finalHash, viemChain!), '_blank')
                    }
                });

                addLog({
                    status: 'success',
                    eventType: config.eventType,
                    data: logData
                });
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

    return notifyEVM;
};

export default useEVMNotifications;
