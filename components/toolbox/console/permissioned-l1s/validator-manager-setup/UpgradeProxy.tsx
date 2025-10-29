"use client";

import { useWalletStore } from "@/components/toolbox/stores/walletStore";
import { useViemChainStore } from "@/components/toolbox/stores/toolboxStore";
import { useSelectedL1 } from "@/components/toolbox/stores/l1ListStore";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/toolbox/components/Button";
import ProxyAdminABI from "@/contracts/openzeppelin-4.9/compiled/ProxyAdmin.json";
import { useToolboxStore } from "@/components/toolbox/stores/toolboxStore";
import { getSubnetInfo } from "@/components/toolbox/coreViem/utils/glacier";
import { EVMAddressInput } from "@/components/toolbox/components/EVMAddressInput";
import { Input } from "@/components/toolbox/components/Input";
import { ProgressSteps as Steps, ProgressStep as Step } from "@/components/toolbox/components/ProgressSteps";
import { WalletRequirementsConfigKey } from "@/components/toolbox/hooks/useWalletRequirements";
import { BaseConsoleToolProps, ConsoleToolMetadata, withConsoleToolMetadata } from "../../../components/WithConsoleToolMetadata";
import { useConnectedWallet } from "@/components/toolbox/contexts/ConnectedWalletContext";
import useConsoleNotifications from "@/hooks/useConsoleNotifications";
import { generateConsoleToolGitHubUrl } from "@/components/toolbox/utils/github-url";

// Storage slot with the admin of the proxy (following EIP1967)
const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

const metadata: ConsoleToolMetadata = {
    title: "Upgrade Proxy Implementation",
    description: "Upgrade the proxy implementation to the desired implementation",
    toolRequirements: [
        WalletRequirementsConfigKey.EVMChainBalance
    ],
    githubUrl: generateConsoleToolGitHubUrl(import.meta.url)
};

function UpgradeProxy({ onSuccess }: BaseConsoleToolProps) {
    const [criticalError, setCriticalError] = useState<Error | null>(null);
    const { validatorManagerAddress } = useToolboxStore();
    const [proxyAdminAddress, setProxyAdminAddress] = useState<`0x${string}` | null>(null);
    const selectedL1 = useSelectedL1()();
    const { publicClient, walletChainId, walletEVMAddress } = useWalletStore();
    const { coreWalletClient } = useConnectedWallet();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [currentImplementation, setCurrentImplementation] = useState<string | null>(null);
    const [desiredImplementation, setDesiredImplementation] = useState<string | null>(null);
    const [proxySlotAdmin, setProxySlotAdmin] = useState<string | null>(null);
    const [contractError, setContractError] = useState<string | undefined>();
    const viemChain = useViemChainStore();

    const [proxyAddress, setProxyAddress] = useState<string>("");

    const { sendCoreWalletNotSetNotification, notify } = useConsoleNotifications();

    // Throw critical errors during render
    if (criticalError) {
        throw criticalError;
    }

    useEffect(() => {
        (async function () {
            try {
                const subnetId = selectedL1?.subnetId;
                if (!subnetId) {
                    return;
                }
                const info = await getSubnetInfo(subnetId);
                const newProxyAddress = info.l1ValidatorManagerDetails?.contractAddress || "";
                setProxyAddress(newProxyAddress);

                if (!newProxyAddress) return
                await readProxyAdminSlot(newProxyAddress);
            } catch (error) {
                setCriticalError(error instanceof Error ? error : new Error(String(error)));
            }
        })()
    }, [walletChainId]);

    // Read the proxy admin from storage slot
    async function readProxyAdminSlot(address: string) {
        try {
            if (!address) return;

            const data = await publicClient.getStorageAt({
                address: address as `0x${string}`,
                slot: ADMIN_SLOT as `0x${string}`,
            });

            if (data) {
                // Convert the bytes32 value to an address (take the last 20 bytes)
                const adminAddress = `0x${data.slice(-40)}` as `0x${string}`;
                setProxySlotAdmin(adminAddress);

                // Always use the admin from storage
                setProxyAdminAddress(adminAddress);
            }
        } catch (error) {
            console.error("Failed to read proxy admin slot:", error);
        }
    }

    useEffect(() => {
        if (proxyAddress) {
            readProxyAdminSlot(proxyAddress);
        }
    }, [proxyAddress]);

    useEffect(() => {
        if (validatorManagerAddress && !desiredImplementation) {
            setDesiredImplementation(validatorManagerAddress);
        }
    }, [validatorManagerAddress, desiredImplementation]);

    useEffect(() => {
        checkCurrentImplementation();
    }, [viemChain, proxyAddress, proxyAdminAddress]);


    async function checkCurrentImplementation() {
        try {
            if (!proxyAddress || !proxyAdminAddress) {
                setCurrentImplementation(null);
                setContractError("Proxy address and admin address are required");
                return;
            }

            const implementation = await publicClient.readContract({
                address: proxyAdminAddress,
                abi: ProxyAdminABI.abi,
                functionName: 'getProxyImplementation',
                args: [proxyAddress],
            });

            setCurrentImplementation(implementation as string);
            setContractError(undefined);
        } catch (error: unknown) {
            setCurrentImplementation(null);
            const errorMessage = error instanceof Error ? error.message : "Failed to read current implementation";
            setContractError(errorMessage);
            console.error(error);
        }
    }

    async function handleUpgrade() {
        if (!desiredImplementation) {
            throw new Error('Implementation address is required');
        }

        if (!proxyAddress) {
            throw new Error('Proxy address is required');
        }

        if (!proxyAdminAddress) {
            throw new Error('Proxy admin address is required');
        }

        setIsUpgrading(true);

        const upgradePromise = coreWalletClient.writeContract({
            address: proxyAdminAddress,
            abi: ProxyAdminABI.abi,
            functionName: 'upgrade',
            args: [proxyAddress, desiredImplementation as `0x${string}`],
            chain: viemChain ?? undefined,
            account: walletEVMAddress as `0x${string}`
        });

        notify({
            type: 'call',
            name: 'Upgrade Proxy'
        }, upgradePromise, viemChain ?? undefined);

        try {
            const hash = await upgradePromise;
            await publicClient.waitForTransactionReceipt({ hash });
            await checkCurrentImplementation();
            onSuccess?.();
        } finally {
            setIsUpgrading(false);
        }
    }

    const isUpgradeNeeded = currentImplementation?.toLowerCase() !== desiredImplementation?.toLowerCase();
    const canUpgrade = !!proxyAddress && !!proxyAdminAddress && !!desiredImplementation && isUpgradeNeeded;

    // Calculate current step and completed steps
    const currentStep = useMemo(() => {
        if (!isUpgradeNeeded && currentImplementation) return 2; // Upgrade done
        if (proxyAddress && currentImplementation) return 2; // Proxy info loaded, on step 2
        return 1; // Starting
    }, [proxyAddress, currentImplementation, isUpgradeNeeded]);

    const completedSteps = useMemo(() => {
        const completed: number[] = [];
        if (proxyAddress && currentImplementation) completed.push(1);
        if (!isUpgradeNeeded && currentImplementation) completed.push(2);
        return completed;
    }, [proxyAddress, currentImplementation, isUpgradeNeeded]);

    return (
        <>

                <Steps currentStep={currentStep} completedSteps={completedSteps}>
                    <Step stepNumber={1}>
                        <h2 className="text-lg font-semibold">Select Proxy to Upgrade</h2>
                        <p className="text-sm text-gray-500">
                            Select the proxy contract you want to upgrade.
                        </p>

                        <EVMAddressInput
                            label="Proxy Address"
                            value={proxyAddress}
                            onChange={setProxyAddress}
                            disabled={isUpgrading}
                            placeholder="Enter proxy address"
                        />
                        <Input
                            label="Proxy Admin Address"
                            value={proxySlotAdmin || ""}
                            disabled
                            placeholder="Proxy admin address will be read from storage"
                        />
                        <Input
                            label="Current Implementation"
                            value={currentImplementation || ""}
                            disabled
                            placeholder="Current implementation address will be shown here"
                            error={contractError}
                        />
                    </Step>
                    <Step stepNumber={2}>
                        <h2 className="text-lg font-semibold">Set new Implementation</h2>
                        <p className="text-sm text-gray-500">
                            Enter the new implementation contract you want the Proxy to point to.
                        </p>

                        <EVMAddressInput
                            label="Desired Implementation"
                            value={desiredImplementation || ""}
                            onChange={(value: string) => setDesiredImplementation(value)}
                            placeholder="Enter desired implementation address"
                        />

                        <Button
                            variant="primary"
                            onClick={handleUpgrade}
                            loading={isUpgrading}
                            disabled={isUpgrading || !canUpgrade}
                        >
                            {!canUpgrade ? (isUpgradeNeeded ? "Enter All Required Addresses" : "Already Up To Date") : "Upgrade Proxy"}
                        </Button>

                    </Step>
                </Steps>


                {!isUpgradeNeeded && currentImplementation && (
                    <p className="mt-4 text-green-600">No change needed - Already up to date</p>
                )}
        </>
    );
}

export default withConsoleToolMetadata(UpgradeProxy, metadata);
