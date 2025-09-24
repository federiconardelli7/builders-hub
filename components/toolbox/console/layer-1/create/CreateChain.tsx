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

interface CreateChainProps extends BaseConsoleToolProps {
    embedded?: boolean;
}

function CreateChain({ onSuccess, embedded = false }: CreateChainProps) {
    const store = useCreateChainStore();
    const subnetId = store(state => state.subnetId);
    const setChainID = store(state => state.setChainID);
    const setSubnetID = store(state => state.setSubnetID);
    const genesisData = store(state => state.genesisData);
    const setGenesisData = store(state => state.setGenesisData);
    const setChainName = store(state => state.setChainName);
    // Ensure tokenAllocations always has a default if empty
    const tokenAllocations = store(state => 
        state.tokenAllocations.length > 0 
            ? state.tokenAllocations 
            : [{ address: '0x0000000000000000000000000000000000000001' as Address, amount: 1000000 }]
    );
    const setTokenAllocations = store(state => state.setTokenAllocations);

    const { pChainAddress, walletEVMAddress } = useWalletStore();
    const { coreWalletClient } = useConnectedWallet();

    const [isCreatingChain, setIsCreatingChain] = useState(false);

    const [localChainName, setLocalChainName] = useState<string>(generateRandomChainName());
    const [vmId, setVmId] = useState<string>(SUBNET_EVM_VM_ID);

    const { notify } = useConsoleNotifications();

    // Initialize or update token allocations with EVM wallet address
    useEffect(() => {
        if (walletEVMAddress) {
            // If tokenAllocations is empty OR has only the placeholder address, update it
            if (tokenAllocations.length === 0) {
                setTokenAllocations([{ address: walletEVMAddress as Address, amount: 1000000 }]);
            } else if (tokenAllocations.length === 1 && 
                       tokenAllocations[0].address === '0x0000000000000000000000000000000000000001') {
                // Replace placeholder address with actual EVM wallet address
                setTokenAllocations([{ address: walletEVMAddress as Address, amount: tokenAllocations[0].amount }]);
            }
        }
    }, [walletEVMAddress, tokenAllocations, setTokenAllocations]);

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
                    <div>
                        <h2 className="text-[14px] font-semibold mb-1">Configure Genesis</h2>
                        <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                            Configure the genesis data for your chain.
                        </p>
                    </div>
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
                            embedded={embedded}
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
                    <div>
                        <h2 className="text-[14px] font-semibold mb-1">Create Chain</h2>
                        <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                            Create your chain by issuing a CreateChainTx transaction.
                        </p>
                    </div>
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

export { CreateChain };
export default withConsoleToolMetadata(CreateChain, metadata);