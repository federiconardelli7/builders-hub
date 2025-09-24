"use client";

import { useCreateChainStore } from "@/components/toolbox/stores/createChainStore";
import { useState, useEffect } from "react";
import { Button } from "@/components/toolbox/components/Button";
import { useWalletStore } from "@/components/toolbox/stores/walletStore";
import GenesisBuilder from '@/components/toolbox/console/layer-1/create/GenesisBuilder';
import { Step, Steps } from "fumadocs-ui/components/steps";
import { SUBNET_EVM_VM_ID } from "@/constants/console";
import { BaseConsoleToolProps, ConsoleToolMetadata, withConsoleToolMetadata } from "../../../components/WithConsoleToolMetadata";
import { useConnectedWallet } from "@/components/toolbox/contexts/ConnectedWalletContext";
import useConsoleNotifications from "@/hooks/useConsoleNotifications";
import { WalletRequirementsConfigKey } from "@/components/toolbox/hooks/useWalletRequirements";
import { Address } from "viem";

// Import new Genesis Wizard components
import { GenesisWizard } from "@/components/toolbox/components/genesis/GenesisWizard";
import { SubnetStep } from "@/components/toolbox/components/genesis/SubnetStep";
import { ChainConfigStep, generateRandomChainName } from "@/components/toolbox/components/genesis/ChainConfigStep";

const metadata: ConsoleToolMetadata = {
    title: "Create Chain",
    description: "Create a subnet and add a new blockchain with custom parameters and genesis data",
    walletRequirements: [
        WalletRequirementsConfigKey.PChainBalance
    ]
};

function CreateChain({ onSuccess }: BaseConsoleToolProps) {
    const {
        subnetId,
        setChainID,
        setSubnetID,
        genesisData,
        setGenesisData,
        setChainName,
        tokenAllocations,
        setTokenAllocations,
    } = useCreateChainStore()();

    const { pChainAddress } = useWalletStore();
    const { coreWalletClient } = useConnectedWallet();

    const [isCreatingChain, setIsCreatingChain] = useState(false);

    const [localChainName, setLocalChainName] = useState<string>(generateRandomChainName());
    const [vmId, setVmId] = useState<string>(SUBNET_EVM_VM_ID);

    const { notify } = useConsoleNotifications();

    // Initialize token allocations if empty
    useEffect(() => {
        if (pChainAddress && tokenAllocations.length === 0) {
            setTokenAllocations([{ address: pChainAddress as Address, amount: 1000000 }]);
        }
    }, [pChainAddress, tokenAllocations.length, setTokenAllocations]);

    // Wrapper function to handle subnet ID changes properly
    const handleSubnetIdChange = (newSubnetId: string) => {
        setSubnetID(newSubnetId);
    };

    async function handleCreateChain() {
        setIsCreatingChain(true);

        const createChainTx = coreWalletClient.createChain({
            chainName: localChainName,
            subnetId: subnetId,
            vmId,
            fxIds: [],
            genesisData: genesisData,
            subnetAuth: [0],
        })

        notify('createChain', createChainTx);

        try {
            const txID = await createChainTx;
            setChainID(txID);
            setChainName(localChainName);
            setLocalChainName(generateRandomChainName());
        } finally {
            setIsCreatingChain(false);
        }
    }

    const canProceedToStep2 = !!subnetId;
    const canProceedToStep3 = canProceedToStep2 && !!genesisData && genesisData !== "" && !genesisData.startsWith("Error:");
    const canCreateChain = canProceedToStep3 && !!localChainName;

    return (
        <div className="space-y-6">
            <Steps>
                {/* Step 1: Create Subnet */}
                <Step>
                    <SubnetStep
                        subnetId={subnetId}
                        onSubnetIdChange={handleSubnetIdChange}
                    />
                </Step>

                {/* Step 2: Genesis Configuration */}
                <Step>
                    {!canProceedToStep2 ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                                    Create or Select a Subnet First
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Please complete the subnet selection in Step 1 before proceeding to configure your chain.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <GenesisWizard
                            genesisData={genesisData}
                            onGenesisDataChange={setGenesisData}
                        >
                            <div className="space-y-6">
                                <ChainConfigStep
                                    chainName={localChainName}
                                    onChainNameChange={setLocalChainName}
                                    vmId={vmId}
                                    onVmIdChange={setVmId}
                                />

                                {/* Show full GenesisBuilder for complete configuration */}
                                <GenesisBuilder
                                    genesisData={genesisData}
                                    setGenesisData={setGenesisData}
                                    initiallyExpandedSections={["chainParams"]}
                                    tokenAllocations={tokenAllocations}
                                    setTokenAllocations={setTokenAllocations}
                                />
                            </div>
                        </GenesisWizard>
                    )}
                </Step>

                {/* Step 3: Create Chain */}
                <Step>
                    {!canProceedToStep3 ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                                    Configure Genesis First
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Please complete the genesis configuration in Step 2 before creating your chain.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <Button
                                onClick={handleCreateChain}
                                loading={isCreatingChain}
                                loadingText="Creating Chain..."
                                disabled={!canCreateChain}
                                className="px-8"
                                size="lg"
                            >
                                Create Chain
                            </Button>
                        </div>
                    )}
                </Step>
            </Steps>
        </div>
    );
}

export default withConsoleToolMetadata(CreateChain, metadata);