"use client";

import { useState } from "react";
import { Button } from "@/components/toolbox/components/Button";
import { Input } from "@/components/toolbox/components/Input";
import InputSubnetId from "@/components/toolbox/components/InputSubnetId";
import { useWalletStore } from "@/components/toolbox/stores/walletStore";
import { useConnectedWallet } from "@/components/toolbox/contexts/ConnectedWalletContext";
import useConsoleNotifications from "@/hooks/useConsoleNotifications";

interface SubnetStepProps {
    subnetId: string;
    onSubnetIdChange: (subnetId: string) => void;
}

export function SubnetStep({ subnetId, onSubnetIdChange }: SubnetStepProps) {
    const { pChainAddress } = useWalletStore();
    const { coreWalletClient } = useConnectedWallet();
    const { notify } = useConsoleNotifications();
    const [isCreatingSubnet, setIsCreatingSubnet] = useState(false);

    const handleCreateSubnet = async () => {
        setIsCreatingSubnet(true);

        const createSubnetTx = coreWalletClient.createSubnet({
            subnetOwners: [pChainAddress]
        });

        notify('createSubnet', createSubnetTx);

        try {
            const txID = await createSubnetTx;
            onSubnetIdChange(txID);
        } finally {
            setIsCreatingSubnet(false);
        }
    };

    return (
        <div className="space-y-4 text-[13px]">
            <div>
                <h2 className="text-[14px] font-semibold mb-1">Create or Select a Subnet</h2>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    Create a new Subnet or enter an existing Subnet ID.
                </p>
            </div>

            <div className="space-y-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-[12px] font-medium mb-2">Create New Subnet</h3>
                    <Input
                        label="Subnet Owner"
                        value={pChainAddress}
                        disabled={true}
                        type="text"
                        className="mb-2"
                    />
                    <Button
                        onClick={handleCreateSubnet}
                        loading={isCreatingSubnet}
                        variant="primary"
                        className="w-full h-8 text-[12px]"
                    >
                        Create Subnet
                    </Button>
                </div>

                <div className="flex items-center">
                    <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
                    <span className="px-3 text-[12px] text-zinc-500">or</span>
                    <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>

                <div>
                    <h3 className="text-[12px] font-medium mb-2">Use Existing Subnet</h3>
                    <InputSubnetId
                        id="create-chain-subnet-id"
                        label="Subnet ID"
                        value={subnetId}
                        onChange={onSubnetIdChange}
                        validationDelayMs={3000}
                        hideSuggestions={true}
                        placeholder="Enter SubnetID"
                    />
                </div>
            </div>

            {/* Success notice intentionally removed for a cleaner compact UI */}
        </div>
    );
}
