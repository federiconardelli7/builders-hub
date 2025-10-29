"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/toolbox/components/Button";
import { Success } from "@/components/toolbox/components/Success";
import { formatEther, parseEther } from 'viem';
import { useViemChainStore } from "@/components/toolbox/stores/toolboxStore";
import { useWalletStore } from "@/components/toolbox/stores/walletStore";
import TeleporterMessengerDeploymentTransaction from '@/contracts/icm-contracts-releases/v1.0.0/TeleporterMessenger_Deployment_Transaction_v1.0.0.txt.json';
import TeleporterMessengerDeployerAddress from '@/contracts/icm-contracts-releases/v1.0.0/TeleporterMessenger_Deployer_Address_v1.0.0.txt.json';
import TeleporterMessengerAddress from '@/contracts/icm-contracts-releases/v1.0.0/TeleporterMessenger_Contract_Address_v1.0.0.txt.json';
import { ProgressSteps as Steps, ProgressStep as Step } from "@/components/toolbox/components/ProgressSteps";
import { WalletRequirementsConfigKey } from "@/components/toolbox/hooks/useWalletRequirements";
import { BaseConsoleToolProps, ConsoleToolMetadata, withConsoleToolMetadata } from "../../../components/WithConsoleToolMetadata";
import { useConnectedWallet } from "@/components/toolbox/contexts/ConnectedWalletContext";
import versions from '@/scripts/versions.json';
import { generateConsoleToolGitHubUrl } from "@/components/toolbox/utils/github-url";

const MINIMUM_BALANCE = parseEther('11');

const ICM_COMMIT = versions["ava-labs/icm-contracts"];
const TELEPORTER_MESSENGER_SOURCE_URL = `https://github.com/ava-labs/icm-contracts/blob/${ICM_COMMIT}/contracts/teleporter/TeleporterMessenger.sol`;

const metadata: ConsoleToolMetadata = {
    title: "Deploy ICM Messenger",
    description: "Deploy the ICM messenger contract to your L1 to enable cross-L1 messaging and applications like ICTT",
    toolRequirements: [
        WalletRequirementsConfigKey.EVMChainBalance
    ],
    githubUrl: generateConsoleToolGitHubUrl(import.meta.url)
};

const TopUpComponent = ({
    deployerAddress,
    onTopUp
}: {
    deployerAddress: `0x${string}`,
    onTopUp: () => void
}) => {
    const [amount, setAmount] = useState(formatEther(MINIMUM_BALANCE));
    const [isSending, setIsSending] = useState(false);
    const [criticalError, setCriticalError] = useState<Error | null>(null);
    const viemChain = useViemChainStore();
    const { publicClient, walletEVMAddress } = useWalletStore();
    const { coreWalletClient } = useConnectedWallet();

    // Throw critical errors during render
    if (criticalError) {
        throw criticalError;
    }

    const handleTopUp = async () => {
        setIsSending(true);
        try {
            const hash = await coreWalletClient.sendTransaction({
                to: deployerAddress as `0x${string}`,
                value: parseEther(amount),
                chain: viemChain,
                account: walletEVMAddress as `0x${string}`,
            });

            await publicClient.waitForTransactionReceipt({ hash });
            onTopUp();
        } catch (error) {
            setCriticalError(error instanceof Error ? error : new Error(String(error)));
        } finally {
            setIsSending(false);
        }
    };

    return (

        <Step stepNumber={1}>
            <h3 className="font-semibold">Top Up Deployer Address</h3>
            <p>The deployer address needs at least {formatEther(MINIMUM_BALANCE)} native coins to send the transaction.</p>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="p-2 rounded w-32"
                />
                <Button
                    variant="primary"
                    onClick={handleTopUp}
                    loading={isSending}
                    disabled={isSending}
                >
                    Send Funds
                </Button>
            </div>
        </Step>)
};

function TeleporterMessenger({ onSuccess }: BaseConsoleToolProps) {
    const [criticalError, setCriticalError] = useState<Error | null>(null);
    const { publicClient } = useWalletStore();
    const { coreWalletClient } = useConnectedWallet();
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployerBalance, setDeployerBalance] = useState(BigInt(0));
    const [isCheckingBalance, setIsCheckingBalance] = useState(true);
    const [isDeployed, setIsDeployed] = useState(false);
    const [txHash, setTxHash] = useState("");

    // Throw critical errors during render
    if (criticalError) {
        throw criticalError;
    }

    const deployerAddress = TeleporterMessengerDeployerAddress.content as `0x${string}`;
    const expectedContractAddress = TeleporterMessengerAddress.content;

    const checkDeployerBalance = async () => {
        setIsCheckingBalance(true);
        try {
            const balance = await publicClient.getBalance({
                address: deployerAddress,
            });

            setDeployerBalance(balance);

            // Also check if contract is already deployed
            const code = await publicClient.getBytecode({
                address: expectedContractAddress as `0x${string}`,
            });

            setIsDeployed(code !== undefined && code !== '0x');
        } catch (error) {
            console.error("Failed to check balance:", error);
        } finally {
            setIsCheckingBalance(false);
        }
    };

    useEffect(() => {
        checkDeployerBalance();
    }, []);

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            // Send the raw presigned transaction
            const hash = await coreWalletClient.sendRawTransaction({
                serializedTransaction: TeleporterMessengerDeploymentTransaction.content as `0x${string}`,
            });

            setTxHash(hash);

            await publicClient.waitForTransactionReceipt({ hash });
            setIsDeployed(true);
            onSuccess?.();

            // Refresh balance after deployment
            await checkDeployerBalance();
        } catch (error) {
            setCriticalError(error instanceof Error ? error : new Error(String(error)));
        } finally {
            setIsDeploying(false);
        }
    };

    const hasEnoughBalance = deployerBalance >= MINIMUM_BALANCE;


    // Calculate current step and completed steps
    const currentStep = useMemo(() => {
        if (txHash || isDeployed) return 3; // Deployed
        if (hasEnoughBalance) return 3; // Ready to deploy
        return 2; // On balance check
    }, [hasEnoughBalance, txHash, isDeployed]);

    const completedSteps = useMemo(() => {
        const completed: number[] = [];
        if (hasEnoughBalance) completed.push(2);
        if (txHash || isDeployed) completed.push(3);
        return completed;
    }, [hasEnoughBalance, txHash, isDeployed]);
    return (
        <>
                <div>
                    <p className="mt-2">This tool deploys the TeleporterMessenger contract, which is the core contract that handles cross-subnet message sending and receiving. Please read more <a href="https://github.com/ava-labs/icm-contracts/blob/main/contracts/teleporter/README.md" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">here</a>.</p>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Contract source: <a href={TELEPORTER_MESSENGER_SOURCE_URL} target="_blank" rel="noreferrer">TeleporterMessenger.sol</a> @ <code>{ICM_COMMIT.slice(0, 7)}</code>
                </p>
                <Steps currentStep={currentStep} completedSteps={completedSteps}>
                    <Step stepNumber={2}>
                        <h2 className="text-lg font-semibold">Check if Deployer Address Balance is sufficient</h2>
                        <p className="text-sm text-gray-500">
                            Enter the parameters for your new chain.
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="font-semibold">Deployer Address:</p>
                                    <code className="block py-2 rounded text-sm break-all">
                                        {deployerAddress}
                                    </code>
                                    <div className="pb-2 text-xs">
                                        TeleporterMessenger_Deployer_Address_v1.0.0.txt.json
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold">Expected Contract Address:</p>
                                    <code className="block py-2 rounded text-sm break-all">
                                        {expectedContractAddress}
                                    </code>
                                    <div className="pb-2 text-xs">
                                        TeleporterMessenger_Contract_Address_v1.0.0.txt.json
                                    </div>
                                </div>
                            </div>

                            {!isDeployed &&
                                <div>
                                    <p className="font-semibold">Deployer Balance:</p>
                                    {isCheckingBalance ? (
                                        <p>Checking balance...</p>
                                    ) : (
                                        <p>{formatEther(deployerBalance)} coins {hasEnoughBalance ? '✅' : '❌'}</p>
                                    )}
                                    <div className="pb-2 text-xs">
                                        Should be at least {formatEther(MINIMUM_BALANCE)} native coins
                                    </div>
                                </div>
                            }

                            {!hasEnoughBalance && !isDeployed && (
                                <TopUpComponent
                                    deployerAddress={deployerAddress}
                                    onTopUp={checkDeployerBalance}
                                />
                            )}
                        </div>
                    </Step>
                    <Step stepNumber={3}>
                        <h2 className="text-lg font-semibold">Deploy ICM Messenger</h2>
                        {isDeployed ? (
                            <div className="py-4">
                                <p className="text-md">Contract Already Deployed</p>
                                <p>The TeleporterMessenger contract is already deployed at the expected address.</p>
                            </div>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleDeploy}
                                loading={isDeploying}
                                disabled={isDeploying || !hasEnoughBalance}
                            >
                                Deploy TeleporterMessenger
                            </Button>
                        )}

                    </Step>
                </Steps>
                {txHash && (
                    <Success
                        label="Transaction Hash"
                        value={txHash}
                    />
                )}

                {isDeployed && (
                    <Success
                        label="TeleporterMessenger Address"
                        value={expectedContractAddress}
                    />
                )}
        </>
    );
}

export default withConsoleToolMetadata(TeleporterMessenger, metadata);
